import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const adminPassword = await bcrypt.hash("admin123", 10);
const anggotaPassword = await bcrypt.hash("anggota123", 10);

await prisma.user.create({
  data: {
    email: "admin@perpus.com",
    password: adminPassword,
    role: "ADMIN",
  },
});

await prisma.user.create({
  data: {
    email: "rizqy@perpus.com",
    password: anggotaPassword,
    role: "ANGGOTA",
    anggota: {
      create: {
        nama: "Rizqy Fadhil",
        nim: "187241097",
      },
    },
  },
});

console.log("Seed berhasil!");
await prisma.$disconnect();