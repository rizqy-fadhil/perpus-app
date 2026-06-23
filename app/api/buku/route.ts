import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const buku = await prisma.buku.findMany({
    orderBy: { createdAt: "desc" },
});
    return NextResponse.json(buku);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const buku = await prisma.buku.create({
    data: {
        judul: body.judul,
        pengarang: body.pengarang,
        kategori: body.kategori,
        stok: body.stok,
    },
});
    return NextResponse.json(buku, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const buku = await prisma.buku.update({
    where: { id: body.id },
    data: {
        judul: body.judul,
        pengarang: body.pengarang,
        kategori: body.kategori,
        stok: body.stok,
    },
});
    return NextResponse.json(buku);
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    await prisma.buku.delete({ where: { id } });
    return NextResponse.json({ message: "Buku berhasil dihapus" });
}