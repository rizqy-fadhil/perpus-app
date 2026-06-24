"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Transaksi = {
  id: number;
  buku: { judul: string };
  tglPinjam: string;
  batasKembali: string;
  tglKembali: string | null;
  denda: number;
  status: string;
};

export default function RiwayatDenda() {
  const { data: session } = useSession();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [totalDenda, setTotalDenda] = useState(0);

  useEffect(() => {
    if (!session) return;

    fetch("/api/anggota")
      .then((res) => res.json())
      .then(async (anggotaList) => {
        const anggota = anggotaList.find(
          (a: any) => a.user.email === session?.user?.email
        );
        if (!anggota) return;

        const res = await fetch(`/api/transaksi?anggotaId=${anggota.id}`);
        const data = await res.json();
        setTransaksiList(data);
        setTotalDenda(data.reduce((acc: number, t: Transaksi) => acc + t.denda, 0));
      });
  }, [session]);

  const statusColor: Record<string, string> = {
    SELESAI: "text-green-600 bg-green-100",
    TERLAMBAT: "text-red-600 bg-red-100",
    DIPINJAM: "text-blue-600 bg-blue-100",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Riwayat Peminjaman & Denda</h1>

      {totalDenda > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="text-xs text-black">STATUS DENDA</p>
              <p className="font-semibold">
                Total Tagihan Denda Anda Saat Ini:{" "}
                <span className="text-red-500">
                  Rp {totalDenda.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            Bayar Denda
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Daftar Transaksi</h2>
        </div>
        <table className="w-full text-sm text-black">
          <thead className="bg-gray-50 text-black uppercase text-xs">
            <tr>
              <th className="p-3 text-left">ID Transaksi</th>
              <th className="p-3 text-left">Judul Buku</th>
              <th className="p-3 text-left">Tgl Pinjam</th>
              <th className="p-3 text-left">Batas Kembali</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Denda</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">TR0{t.id}</td>
                <td className="p-3">{t.buku.judul}</td>
                <td className="p-3">
                  {new Date(t.tglPinjam).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  {new Date(t.batasKembali).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusColor[t.status]}`}
                  >
                    {t.status}
                  </span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}