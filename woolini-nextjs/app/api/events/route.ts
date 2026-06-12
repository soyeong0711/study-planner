import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const events = await prisma.calendarEvent.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "일정을 조회하는 데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { title, date, color } = await req.json();
    if (!title || !date) {
      return NextResponse.json({ error: "일정명과 날짜를 입력해주세요." }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        date: new Date(date),
        color: color || "#8b5cf6",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "일정을 생성하는 데 실패했습니다." }, { status: 500 });
  }
}
