import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIStudyFeedback } from "@/lib/gemini";
import { upsertStudyRecord } from "@/lib/pinecone";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 1. Gather stats from character
    const character = await prisma.character.findUnique({
      where: { userId },
      include: {
        user: {
          select: { geminiApiKey: true }
        }
      }
    });

    if (!character) {
      return NextResponse.json({ error: "캐릭터 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. Calculate subject ratios
    const tasksWithSubjects = await prisma.task.findMany({
      where: { userId },
      include: { subject: true },
    });

    const subjectCounts: Record<string, number> = {};
    tasksWithSubjects.forEach((task: any) => {
      if (task.subject) {
        subjectCounts[task.subject.name] = (subjectCounts[task.subject.name] || 0) + 1;
      } else {
        subjectCounts["기타"] = (subjectCounts["기타"] || 0) + 1;
      }
    });

    const totalTasks = tasksWithSubjects.length;
    const subjectRatios = totalTasks > 0
      ? Object.entries(subjectCounts)
          .map(([name, count]) => `${name}: ${Math.round((count / totalTasks) * 100)}%`)
          .join(", ")
      : "기록 없음";

    // 3. Call Gemini to generate feedback
    const feedback = await generateAIStudyFeedback({
      totalStudyTime: character.totalStudyTime,
      completedCount: character.completedTasks,
      partialCount: character.partialTasks,
      failedCount: character.failedTasks,
      subjectRatios,
    }, (character as any).user?.geminiApiKey);

    // 4. Save feedback action in Pinecone for personalization context
    await upsertStudyRecord(userId, `feedback_${Date.now()}`, `AI 학습 분석 피드백 받음: ${feedback}`, {
      type: "ai_feedback_generated",
      totalStudyTime: character.totalStudyTime,
      completionRate: totalTasks > 0 ? (character.completedTasks / totalTasks) * 100 : 0,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("AI Feedback generation error:", error);
    return NextResponse.json({ error: "AI 피드백을 생성하는 데 실패했습니다." }, { status: 500 });
  }
}
