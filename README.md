# 📚 Perpustakaan UNAIR — Sistem Informasi Peminjaman Buku

Sistem Informasi Peminjaman Buku Perpustakaan berbasis web yang dibangun menggunakan Next.js, Prisma ORM, dan PostgreSQL (Neon). Digunakan sebagai tugas akhir mata kuliah Analisis dan Perancangan Sistem Informasi (APSI) — Universitas Airlangga.

## 🔗 Live Demo

[https://perpus-app-sable.vercel.app](https://perpus-app-sable.vercel.app)

## 🔑 Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@perpus.com | password |

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma v6
- **Auth:** NextAuth.js v4
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## ✨ Fitur

### Admin
- Dashboard statistik (total buku, anggota, peminjaman berjalan)
- Manajemen data buku (CRUD)
- Pendaftaran anggota baru
- Laporan transaksi lengkap

### Anggota
- Katalog buku dengan pencarian real-time
- Peminjaman & pengembalian buku
- Riwayat transaksi & status denda otomatis

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js 18+
- Laragon (MySQL) atau PostgreSQL

### Instalasi

```bash
# Clone repositori
git clone https://github.com/rizqy-fadhil/perpus-app.git
cd perpus-app

# Install dependencies
npm install

# Setup environment variable
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal

# Jalankan migrasi
npx prisma migrate dev

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Project
/perpus-app
├── app/
│   ├── admin/          ← halaman admin (dashboard, buku, anggota, laporan)
│   ├── anggota/        ← halaman anggota (katalog, transaksi, riwayat)
│   ├── api/            ← API Routes (auth, buku, anggota, transaksi)
│   └── login/          ← halaman login
├── lib/
│   ├── prisma.ts       ← Prisma Client
│   └── auth.ts         ← konfigurasi NextAuth
├── prisma/
│   └── schema.prisma   ← skema database
└── proxy.ts            ← proteksi rute berdasarkan role
## 👥 Tim Pengembang

Tugas APSI — Kelas I2 — Universitas Airlangga
