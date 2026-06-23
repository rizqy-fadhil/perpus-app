import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Buat user admin
const adminUser = await prisma.user.create({
    data: {
        email: "admin@perpus.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
    },
});

  // Buat user anggota + data anggota
const anggotaUser = await prisma.user.create({
    data: {
        email: "rizqy@perpus.com",
        password: await bcrypt.hash("anggota123", 10),
        role: "ANGGOTA",
        anggota: {
        create: {
            nama: "Rizqy Fadhil",
            nim: "187241097",
        },
    },
    },
});

    console.log("Seed berhasil!", { adminUser, anggotaUser });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());