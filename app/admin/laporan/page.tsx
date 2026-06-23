import { prisma } from "@/lib/prisma";

export default async function LaporanTransaksi() {
  const transaksi = await prisma.transaksi.findMany({
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
      <h1 className="text-2xl font-bold mb-6">Laporan Transaksi</h1>
      <div className="bg-white rounded shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Periode:</span>
            <select className="border px-2 py-1 rounded text-sm">
              <option>Semua Waktu</option>
            </select>
          </div>
          <button className="border px-4 py-2 rounded text-sm flex items-center gap-2">
            🖨️ Print / Cetak Laporan
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">ID Transaksi</th>
              <th className="p-3 text-left">Nama Anggota</th>
              <th className="p-3 text-left">Judul Buku</th>
              <th className="p-3 text-left">Tgl Pinjam</th>
              <th className="p-3 text-left">Tgl Kembali</th>
              <th className="p-3 text-left">Denda</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">TR0{t.id}</td>
                <td className="p-3">{t.anggota.nama}</td>
                <td className="p-3">{t.buku.judul}</td>
                <td className="p-3">
                  {new Date(t.tglPinjam).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  {t.tglKembali
                    ? new Date(t.tglKembali).toLocaleDateString("id-ID")
                    : "-"}
                </td>
                <td className="p-3">
                  {t.denda > 0 ? (
                    <span className="text-red-500">
                      Rp {t.denda.toLocaleString("id-ID")}
                    </span>
                  ) : (
                    "Rp 0"
                  )}
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