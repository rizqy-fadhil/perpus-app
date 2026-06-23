import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  const anggota = await prisma.anggota.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(anggota);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      role: "ANGGOTA",
      anggota: {
        create: {
          nama: body.nama,
          nim: body.nim,
        },
      },
    },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.anggota.delete({ where: { id } });
  return NextResponse.json({ message: "Anggota berhasil dihapus" });
}