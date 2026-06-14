import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateTaskDifficulty } from "@/lib/gemini";
import { upsertStudyRecord } from "@/lib/pinecone";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "할 일을 조회하는 데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { title, subjectId, scheduledAt } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "할 일 제목을 입력해주세요." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKey: true },
    });

    // Call Gemini API to estimate difficulty and XP
    const aiEstimation = await estimateTaskDifficulty(title, user?.geminiApiKey);

    // Save task to the database
    const task = await prisma.task.create({
      data: {
        userId,
        subjectId: subjectId || null,
        title,
        status: "TODO",
        difficulty: aiEstimation.difficulty,
        expReward: aiEstimation.expReward,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        subject: true,
      },
    });

    // Save to Pinecone vector DB for personalization / RAG search
    const subjectName = task.subject?.name || "기타";
    const vectorText = `사용자가 공부 과목 [${subjectName}]에 대해 "${title}" 할 일을 추가했습니다. AI 판정 난이도: ${aiEstimation.difficulty}, 보상 경험치: ${aiEstimation.expReward} XP.`;
    await upsertStudyRecord(userId, task.id, vectorText, {
      type: "task_created",
      subject: subjectName,
      title: task.title,
      difficulty: aiEstimation.difficulty,
      expReward: aiEstimation.expReward,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "할 일을 생성하는 데 실패했습니다." }, { status: 500 });
  }
}
