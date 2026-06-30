import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DENDA_PER_HARI = 2500;
const BATAS_HARI = 7;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anggotaId = searchParams.get("anggotaId");

  const transaksi = await prisma.transaksi.findMany({
    where: anggotaId ? { anggotaId: parseInt(anggotaId) } : {},
    include: {
      anggota: true,
      buku: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(transaksi);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Check if user already has an active borrow for the same book
  const existingBorrow = await prisma.transaksi.findFirst({
    where: {
      anggotaId: body.anggotaId,
      bukuId: body.bukuId,
      status: "DIPINJAM",
    },
  });

  if (existingBorrow) {
    return NextResponse.json(
      { error: "Anda sudah meminjam buku ini. Kembalikan terlebih dahulu sebelum meminjam lagi." },
      { status: 400 }
    );
  }

  const tglPinjam = new Date();
  const batasKembali = new Date();
  batasKembali.setDate(tglPinjam.getDate() + BATAS_HARI);

  const transaksi = await prisma.transaksi.create({
    data: {
      anggotaId: body.anggotaId,
      bukuId: body.bukuId,
      tglPinjam,
      batasKembali,
      status: "DIPINJAM",
    },
  });

  await prisma.buku.update({
    where: { id: body.bukuId },
    data: { stok: { decrement: 1 } },
  });

  return NextResponse.json(transaksi, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const transaksi = await prisma.transaksi.findUnique({
    where: { id: body.id },
  });

  const tglKembali = new Date();
  const batas = new Date(transaksi!.batasKembali);
  const selisihHari = Math.floor(
    (tglKembali.getTime() - batas.getTime()) / (1000 * 60 * 60 * 24)
  );
  const denda = selisihHari > 0 ? selisihHari * DENDA_PER_HARI : 0;
  const status = selisihHari > 0 ? "TERLAMBAT" : "SELESAI";

  const updated = await prisma.transaksi.update({
    where: { id: body.id },
    data: { tglKembali, denda, status },
  });

  await prisma.buku.update({
    where: { id: transaksi!.bukuId },
    data: { stok: { increment: 1 } },
  });

  return NextResponse.json(updated);
}