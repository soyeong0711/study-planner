import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  try {
    const { title, date, color } = await req.json();

    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id, userId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        date: date !== undefined ? new Date(date) : existingEvent.date,
        color: color !== undefined ? color : existingEvent.color,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json({ error: "일정을 수정하는 데 실패했습니다." }, { status: 500 });
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
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id, userId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event deletion error:", error);
    return NextResponse.json({ error: "일정을 삭제하는 데 실패했습니다." }, { status: 500 });
  }
}
