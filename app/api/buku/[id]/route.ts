import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const buku = await prisma.buku.findUnique({
        where: { id: parseInt(id) },
    });
    return NextResponse.json(buku);
}