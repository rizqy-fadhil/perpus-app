import { prisma } from "@/lib/prisma";

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

  const statusColor: Record<string, string> = {
    DIPINJAM: "bg-yellow-100 text-yellow-700",
    SELESAI: "bg-green-100 text-green-700",
    TERLAMBAT: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded shadow p-6">
          <p className="text-xs text-gray-700 uppercase mb-2">Total Koleksi Buku</p>
          <p className="text-4xl font-bold">{totalBuku}</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-xs text-gray-700 uppercase mb-2">Total Anggota Aktif</p>
          <p className="text-4xl font-bold">{totalAnggota}</p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <p className="text-xs text-gray-700 uppercase mb-2">Peminjaman Berjalan</p>
          <p className="text-4xl font-bold">{peminjamaBerjalan}</p>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="bg-white rounded shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Riwayat Transaksi Terbaru</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">ID Transaksi</th>
              <th className="p-3 text-left">Nama Anggota</th>
              <th className="p-3 text-left">Judul Buku</th>
              <th className="p-3 text-left">Tanggal Pinjam</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transaksiTerbaru.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">TR0{t.id}</td>
                <td className="p-3">{t.anggota.nama}</td>
                <td className="p-3">{t.buku.judul}</td>
                <td className="p-3">
                  {new Date(t.tglPinjam).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusColor[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}