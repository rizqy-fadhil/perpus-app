-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ANGGOTA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DIPINJAM', 'SELESAI', 'TERLAMBAT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANGGOTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anggota" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buku" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "pengarang" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "bukuId" INTEGER NOT NULL,
    "tglPinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batasKembali" TIMESTAMP(3) NOT NULL,
    "tglKembali" TIMESTAMP(3),
    "denda" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'DIPINJAM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_userId_key" ON "Anggota"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Anggota_nim_key" ON "Anggota"("nim");

-- AddForeignKey
ALTER TABLE "Anggota" ADD CONSTRAINT "Anggota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "Anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_bukuId_fkey" FOREIGN KEY ("bukuId") REFERENCES "Buku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
