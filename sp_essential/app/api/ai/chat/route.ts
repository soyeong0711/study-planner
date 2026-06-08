import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAIStudyMateResponse } from "@/lib/gemini";
import { queryStudyRecords, upsertStudyRecord } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { message, history } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
    }

    // 1. RAG: Search Pinecone for relevant study logs
    const relevantLogs = await queryStudyRecords(userId, message, 3);
    let contextualPrompt = message;

    if (relevantLogs && relevantLogs.length > 0) {
      const logsSummary = relevantLogs
        .map((log: any, idx) => `[기록 ${idx + 1}] ${log.text}`)
        .join("\n");
      
      contextualPrompt = `[참고용 학습 기록 컨텍스트]\n${logsSummary}\n\n사용자 메시지: ${message}\n\n위 참고용 기록을 바탕으로 사용자의 실제 학습 현황(공부 시간, 과제 수행)을 파악하고 대화에 자연스럽게 녹여서 조언해 주세요.`;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKey: true },
    });

    // 2. Call Gemini
    const reply = await getAIStudyMateResponse(history, contextualPrompt, user?.geminiApiKey);

    // 3. Save chat history to Pinecone for future RAG context
    const chatRecordId = `chat_${Date.now()}`;
    await upsertStudyRecord(userId, `${chatRecordId}_user`, `사용자 질문: ${message}`, {
      type: "chat_user",
      text: message,
    });
    await upsertStudyRecord(userId, `${chatRecordId}_model`, `AI 스터디메이트 답변: ${reply}`, {
      type: "chat_model",
      text: reply,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: "AI 답변을 생성하는 데 실패했습니다." }, { status: 500 });
  }
}
