import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertStudyRecord } from "@/lib/pinecone";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  try {
    const { status, studyTime } = await req.json();

    const existingTask = await prisma.task.findUnique({
      where: { id, userId },
      include: { subject: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
    }

    const expReward = existingTask.expReward;
    const oldStatus = existingTask.status;

    // Get user's character
    let character = await prisma.character.findUnique({
      where: { userId },
    });

    if (!character) {
      character = await prisma.character.create({
        data: {
          userId,
          name: "올리니",
        },
      });
    }

    // 1. Calculate XP change based on status transition
    const getXp = (s: string) => {
      if (s === "DONE") return expReward;
      if (s === "PARTIAL") return Math.floor(expReward / 2);
      return 0;
    };

    const xpDiff = getXp(status) - getXp(oldStatus);

    // 2. Calculate new Level & XP
    let newLevel = character.level;
    let newExp = character.exp + xpDiff;
    let leveledUp = false;

    if (newExp < 0) {
      newExp = 0; // Prevent negative XP
    }

    // Level up check
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel += 1;
      leveledUp = true;
    }

    // 3. Update character metrics count
    let completedDiff = (status === "DONE" ? 1 : 0) - (oldStatus === "DONE" ? 1 : 0);
    let partialDiff = (status === "PARTIAL" ? 1 : 0) - (oldStatus === "PARTIAL" ? 1 : 0);
    let failedDiff = (status === "FAILED" ? 1 : 0) - (oldStatus === "FAILED" ? 1 : 0);

    // 4. Update task study time
    let studyTimeDiff = 0;
    if (studyTime !== undefined) {
      studyTimeDiff = studyTime - existingTask.studyTime;
    }

    // 5. Save updates to DB
    const [updatedTask, updatedCharacter] = await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: {
          status: status || oldStatus,
          studyTime: studyTime !== undefined ? studyTime : existingTask.studyTime,
        },
      }),
      prisma.character.update({
        where: { userId },
        data: {
          level: newLevel,
          exp: newExp,
          totalStudyTime: { increment: studyTimeDiff },
          completedTasks: { increment: completedDiff },
          partialTasks: { increment: partialDiff },
          failedTasks: { increment: failedDiff },
        },
      }),
    ]);

    // Save update to Pinecone
    const subjectName = existingTask.subject?.name || "기타";
    if (status && status !== oldStatus) {
      const vectorText = `사용자가 과목 [${subjectName}]에 대해 "${existingTask.title}" 할 일 상태를 ${oldStatus}에서 ${status}(으)로 변경했습니다. 결과 경험치 변동: ${xpDiff} XP. 총 레벨: Lv.${newLevel}.`;
      await upsertStudyRecord(userId, `${id}_status`, vectorText, {
        type: "task_status_changed",
        subject: subjectName,
        title: existingTask.title,
        status,
        xpDiff,
        level: newLevel,
      });
    }

    if (studyTimeDiff > 0) {
      const vectorText = `사용자가 "${existingTask.title}" 할 일을 ${studyTimeDiff}분 동안 공부했습니다. 총 누적 공부시간: ${updatedCharacter.totalStudyTime}분.`;
      await upsertStudyRecord(userId, `${id}_studytime`, vectorText, {
        type: "study_time_added",
        subject: subjectName,
        title: existingTask.title,
        addedTime: studyTimeDiff,
        totalTime: updatedCharacter.totalStudyTime,
      });
    }

    return NextResponse.json({
      task: updatedTask,
      character: updatedCharacter,
      leveledUp,
    });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "할 일을 수정하는 데 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
    }

    // Clean up XP from character if it was completed or partially completed
    const getXp = (s: string) => {
      if (s === "DONE") return existingTask.expReward;
      if (s === "PARTIAL") return Math.floor(existingTask.expReward / 2);
      return 0;
    };

    const xpToDeduct = getXp(existingTask.status);

    const character = await prisma.character.findUnique({
      where: { userId },
    });

    if (character && xpToDeduct > 0) {
      let newExp = character.exp - xpToDeduct;
      if (newExp < 0) {
        newExp = 0;
      }

      await prisma.character.update({
        where: { userId },
        data: {
          exp: newExp,
          totalStudyTime: { decrement: existingTask.studyTime },
          completedTasks: { decrement: existingTask.status === "DONE" ? 1 : 0 },
          partialTasks: { decrement: existingTask.status === "PARTIAL" ? 1 : 0 },
          failedTasks: { decrement: existingTask.status === "FAILED" ? 1 : 0 },
        },
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task deletion error:", error);
    return NextResponse.json({ error: "할 일을 삭제하는 데 실패했습니다." }, { status: 500 });
  }
}
