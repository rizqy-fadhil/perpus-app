import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MAX_STOK = 100;

function validateBukuBody(body: {
    judul?: string;
    pengarang?: string;
    stok?: number;
}) {
    const errors: Record<string, string> = {};
    if (!body.judul?.trim()) errors.judul = "Judul buku wajib diisi";
    if (!body.pengarang?.trim()) errors.pengarang = "Pengarang wajib diisi";
    if (typeof body.stok !== "number" || Number.isNaN(body.stok)) {
        errors.stok = "Stok tidak valid";
    } else if (body.stok > MAX_STOK) {
        errors.stok = `Stok maksimal ${MAX_STOK}`;
    } else if (body.stok < 0) {
        errors.stok = "Stok tidak boleh negatif";
    }
    return errors;
}

export async function GET() {
    const buku = await prisma.buku.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(buku);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const errors = validateBukuBody(body);
    if (Object.keys(errors).length > 0) {
        return NextResponse.json({ errors }, { status: 400 });
    }

    const buku = await prisma.buku.create({
        data: {
            judul: body.judul.trim(),
            pengarang: body.pengarang.trim(),
            kategori: body.kategori,
            stok: body.stok,
        },
    });
    return NextResponse.json(buku, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const errors = validateBukuBody(body);
    if (Object.keys(errors).length > 0) {
        return NextResponse.json({ errors }, { status: 400 });
    }

    const buku = await prisma.buku.update({
        where: { id: body.id },
        data: {
            judul: body.judul.trim(),
            pengarang: body.pengarang.trim(),
            kategori: body.kategori,
            stok: body.stok,
        },
    });
    return NextResponse.json(buku);
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    await prisma.transaksi.deleteMany({
        where: { bukuId: id },
    });

    await prisma.buku.delete({ where: { id } });
    return NextResponse.json({ message: "Buku berhasil dihapus" });
}
