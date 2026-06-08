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
    const character = await prisma.character.findUnique({
      where: { userId },
    });

    if (!character) {
      // Lazy initialize character if it somehow doesn't exist
      const newCharacter = await prisma.character.create({
        data: {
          userId,
          name: "올리니",
        },
      });
      return NextResponse.json(newCharacter);
    }

    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: "캐릭터 정보를 조회하는 데 실패했습니다." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { name, imageUrl } = await req.json();

    const character = await prisma.character.findUnique({
      where: { userId },
    });

    if (!character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    const updatedCharacter = await prisma.character.update({
      where: { userId },
      data: {
        name: name !== undefined ? name : character.name,
        imageUrl: imageUrl !== undefined ? imageUrl : character.imageUrl,
      },
    });

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error("Character update error:", error);
    return NextResponse.json({ error: "캐릭터 설정을 업데이트하는 데 실패했습니다." }, { status: 500 });
  }
}
