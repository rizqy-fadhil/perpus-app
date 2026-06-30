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
  try {
    const { id } = await req.json();

    // Cari anggota dan periksa apakah ada
    const anggota = await prisma.anggota.findUnique({ where: { id } });
    if (!anggota) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    // Periksa apakah anggota memiliki transaksi yang terkait
    const transaksi = await prisma.transaksi.findFirst({ where: { anggotaId: id } });
    if (transaksi) {
      return NextResponse.json({ error: "Anggota memiliki riwayat transaksi dan tidak dapat dihapus." }, { status: 400 });
    }

    // Hapus anggota terlebih dahulu karena ada foreign key di transaksi,
    // lalu hapus user karena user adalah entitas utama (meskipun anggota punya userId, tapi relasinya onDelete Restrict default).
    await prisma.anggota.delete({ where: { id } });
    await prisma.user.delete({ where: { id: anggota.userId } });

    return NextResponse.json({ message: "Anggota dan User berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus anggota" }, { status: 500 });
  }
}