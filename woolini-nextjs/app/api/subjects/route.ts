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
    const subjects = await prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: "과목을 조회하는 데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { name, color } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "과목명을 입력해주세요." }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        userId,
        name,
        color: color || "#8b5cf6",
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: "과목을 생성하는 데 실패했습니다." }, { status: 500 });
  }
}
