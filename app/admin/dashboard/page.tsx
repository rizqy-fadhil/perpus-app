import { prisma } from "@/lib/prisma";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function DashboardAdmin() {
  const totalBuku = await prisma.buku.count();
  const totalAnggota = await prisma.anggota.count();
  const peminjamaBerjalan = await prisma.transaksi.count({
    where: { status: "DIPINJAM" },
  });
  const transaksiTerbaru = await prisma.transaksi.findMany({
    take: 5,
    include: { anggota: true, buku: true },
    orderBy: { createdAt: "desc" },
  });

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    DIPINJAM: { label: "Dipinjam", bg: "bg-yellow-100", text: "text-yellow-700" },
    SELESAI: { label: "Dikembalikan", bg: "bg-green-100", text: "text-green-700" },
    TERLAMBAT: { label: "Terlambat", bg: "bg-red-100", text: "text-red-700" },
  };

  const stats = [
    {
      label: "TOTAL KOLEKSI BUKU",
      value: totalBuku.toLocaleString("id-ID"),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "TOTAL ANGGOTA AKTIF",
      value: totalAnggota.toLocaleString("id-ID"),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "PEMINJAMAN BERJALAN",
      value: peminjamaBerjalan.toLocaleString("id-ID"),
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaksi Terbaru */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex justify-between items-center px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            Riwayat Transaksi Terbaru
          </h2>
          <Link
            href="/admin/laporan"
            className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ID Transaksi
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nama Anggota
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Judul Buku
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tanggal Pinjam
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transaksiTerbaru.map((t) => {
              const config = statusConfig[t.status] || {
                label: t.status,
                bg: "bg-gray-100",
                text: "text-gray-700",
              };
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    TR{String(t.id).padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{t.anggota.nama}</td>
                  <td className="px-6 py-4 text-gray-700">{t.buku.judul}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(t.tglPinjam).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                    >
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {transaksiTerbaru.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}