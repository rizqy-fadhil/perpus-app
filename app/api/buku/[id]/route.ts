import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
const buku = await prisma.buku.findUnique({
    where: { id: parseInt(params.id) },
});
    return NextResponse.json(buku);
}