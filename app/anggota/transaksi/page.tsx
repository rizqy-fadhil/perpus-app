"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Buku = { id: number; judul: string; stok: number };
type Transaksi = {
  id: number;
  buku: { judul: string };
  tglPinjam: string;
  status: string;
};

export default function TransaksiPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"pinjam" | "kembali">("pinjam");
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [transaksiAktif, setTransaksiAktif] = useState<Transaksi[]>([]);
  const [anggotaId, setAnggotaId] = useState<number | null>(null);
  const [selectedBuku, setSelectedBuku] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState("");
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch("/api/buku")
      .then((r) => r.json())
      .then(setBukuList);

    fetch("/api/anggota")
      .then((r) => r.json())
      .then((list) => {
        const anggota = list.find(
          (a: any) => a.user.email === session?.user?.email
        );
        if (!anggota) return;
        setAnggotaId(anggota.id);
        fetch(`/api/transaksi?anggotaId=${anggota.id}`)
          .then((r) => r.json())
          .then((data) =>
            setTransaksiAktif(data.filter((t: any) => t.status === "DIPINJAM"))
          );
      });
  }, [session]);

  const handlePinjam = async () => {
    if (!selectedBuku || !anggotaId) return;
    await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anggotaId, bukuId: parseInt(selectedBuku) }),
    });
    setPesan("Peminjaman berhasil!");
    setSelectedBuku("");
  };

  const handleKembali = async () => {
    if (!selectedTransaksi) return;
    await fetch("/api/transaksi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(selectedTransaksi) }),
    });
    setPesan("Pengembalian berhasil!");
    setSelectedTransaksi("");
  };

  const tglHariIni = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tglBatas = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">
        Sirkulasi Perpustakaan
      </h1>
      <p className="text-center text-black mb-6">
        Lakukan peminjaman atau pengembalian buku Anda di sini.
      </p>

      {pesan && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm">
          {pesan}
        </div>
      )}

      {/* Tab */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => { setTab("pinjam"); setPesan(""); }}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "pinjam"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black"
          }`}
        >
          PEMINJAMAN BUKU
        </button>
        <button
          onClick={() => { setTab("kembali"); setPesan(""); }}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "kembali"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black"
          }`}
        >
          PENGEMBALIAN BUKU
        </button>
      </div>

      {tab === "pinjam" ? (
        <div className="bg-white rounded shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Pilih Buku</label>
            <select
              value={selectedBuku}
              onChange={(e) => setSelectedBuku(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Pilih judul buku dari katalog...</option>
              {bukuList
                .filter((b) => b.stok > 0)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.judul}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Tanggal Pinjam
              </label>
              <input
                type="text"
                value={tglHariIni}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Batas Pengembalian (7 Hari)
              </label>
              <input
                type="text"
                value={tglBatas}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-50"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePinjam}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Pinjam
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Buku yang Dikembalikan
            </label>
            <select
              value={selectedTransaksi}
              onChange={(e) => setSelectedTransaksi(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Pilih buku yang sedang dipinjam...</option>
              {transaksiAktif.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.buku.judul} (Dipinjam:{" "}
                  {new Date(t.tglPinjam).toLocaleDateString("id-ID")})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleKembali}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Kembalikan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}