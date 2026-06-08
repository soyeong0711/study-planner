import { GoogleGenAI } from "@google/genai";

function getAIClient(customApiKey?: string | null) {
  const key = customApiKey || process.env.GEMINI_API_KEY || "placeholder_key";
  return new GoogleGenAI({ apiKey: key });
}

export interface DifficultyResponse {
  difficulty: "매우 쉬움" | "쉬움" | "보통" | "어려움" | "매우 어려움";
  expReward: number;
  estimatedTime: number;
}

export async function estimateTaskDifficulty(title: string, customApiKey?: string | null): Promise<DifficultyResponse> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "placeholder_key";
  if (!apiKey || apiKey === "placeholder_key") {
    // Return mock data if API key is not configured
    return {
      difficulty: "보통",
      expReward: 40,
      estimatedTime: 45,
    };
  }

  try {
    const ai = getAIClient(customApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `사용자가 등록한 공부 할 일 제목: "${title}"
이 할 일의 난이도를 분석해주세요.
난이도 체계:
- 매우 쉬움 (경험치: 10 XP, 예상 시간: 15분)
- 쉬움 (경험치: 20 XP, 예상 시간: 30분)
- 보통 (경험치: 40 XP, 예상 시간: 45분)
- 어려움 (경험치: 70 XP, 예상 시간: 60분)
- 매우 어려움 (경험치: 120 XP, 예상 시간: 120분)

다음 JSON 형식으로만 정확히 반환해주세요. 다른 설명이나 마크다운 백틱은 포함하지 마십시오:
{
  "difficulty": "매우 쉬움" | "쉬움" | "보통" | "어려움" | "매우 어려움",
  "expReward": 10 | 20 | 40 | 70 | 120,
  "estimatedTime": number
}`,
    });

    const text = response.text || "";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText) as DifficultyResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      difficulty: "보통",
      expReward: 40,
      estimatedTime: 45,
    };
  }
}

export async function generateAIStudyFeedback(stats: {
  totalStudyTime: number;
  completedCount: number;
  partialCount: number;
  failedCount: number;
  subjectRatios: string;
}, customApiKey?: string | null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "placeholder_key";
  if (!apiKey || apiKey === "placeholder_key") {
    return "AI 분석을 활성화하려면 Gemini API 키를 설정해주세요! 현재는 임시 모드입니다. 학습 총량은 훌륭합니다.";
  }

  try {
    const ai = getAIClient(customApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `다음 학습 통계를 분석하여 따뜻하고 구체적인 피드백과 내일의 학습 가이드를 한글로 3~4줄 요약해서 작성해주세요.
- 총 공부 시간: ${stats.totalStudyTime}분
- 완료한 일: ${stats.completedCount}개, 부분 완료: ${stats.partialCount}개, 미완료: ${stats.failedCount}개
- 과목별 학습 비율: ${stats.subjectRatios}
오늘 공부한 흐름을 보고 피드백하고 부족한 과목이 있다면 추천 계획을 포함해주세요.`,
    });
    return response.text || "피드백을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Feedback Error:", error);
    return "학습 분석 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.";
  }
}

export async function getAIStudyMateResponse(
  history: { role: "user" | "model"; parts: string[] }[],
  message: string,
  customApiKey?: string | null
) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "placeholder_key";
  if (!apiKey || apiKey === "placeholder_key") {
    return "API 키가 등록되지 않아 스터디 메이트 답변을 생성할 수 없습니다.";
  }

  try {
    const formattedHistory = history.map((h) => ({
      role: h.role,
      parts: [{ text: h.parts[0] }],
    }));

    const ai = getAIClient(customApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory.map(h => ({ role: h.role, parts: [{ text: h.parts[0].text }] })),
        { role: "user", parts: [{ text: message }] }
      ],
      // Adding a system instruction for study helper persona
      config: {
        systemInstruction: "당신은 학생들의 공부를 도와주는 친절하고 똑똑한 AI 스터디 메이트입니다. 학생들의 질문(개념 설명, 계획 수립, 공부 팁)에 성실하고 격려하는 어조로 답변해주세요.",
      }
    });

    return response.text || "죄송해요, 답변을 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "스터디 메이트 서버에 문제가 발생했습니다.";
  }
}

export async function generateAutoStudyPlan(input: {
  daysLeft: number;
  dailyTime: number;
  subjects: string[];
}, customApiKey?: string | null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || "placeholder_key";
  if (!apiKey || apiKey === "placeholder_key") {
    return JSON.stringify({
      plans: [
        { day: 1, content: "수학 미적분 공식 정리 (2시간), 영어 독해 3지문 (2시간)" },
        { day: 2, content: "자료구조 정렬 알고리즘 학습 (2시간), 수학 예제 풀이 (2시간)" }
      ]
    });
  }

  try {
    const ai = getAIClient(customApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `시험까지 ${input.daysLeft}일이 남았고, 하루에 ${input.dailyTime}시간 공부가 가능합니다.
공부할 과목들: ${input.subjects.join(", ")}

남은 기간 동안의 과목별 밸런스를 맞춘 학습 플랜을 자동 생성해주세요.
결과는 반드시 아래의 JSON 형식으로만 정확히 반환해주시고 다른 텍스트나 마크다운은 절대 포함하지 마십시오.

{
  "plans": [
    { "day": 1, "content": "1일차 공부 내용 요약" },
    ...
  ]
}`,
    });

    const text = response.text || "";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Auto Plan Error:", error);
    return { plans: [] };
  }
}
