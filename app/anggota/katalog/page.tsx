"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Buku = {
  id: number;
  judul: string;
  pengarang: string;
  kategori: string;
  stok: number;
};

export default function KatalogBuku() {
    const { data: session } = useSession();
    const [bukuList, setBukuList] = useState<Buku[]>([]);
    const [search, setSearch] = useState("");
 
  useEffect(() => {
    fetch("/api/buku")
      .then((res) => res.json())
      .then((data) => setBukuList(data));
  }, []);

  const filtered = bukuList.filter(
    (b) =>
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.pengarang.toLowerCase().includes(search.toLowerCase())
  );

  const handlePinjam = async (bukuId: number) => {
    const res = await fetch("/api/anggota");
    const anggotaList = await res.json();
    const anggota = anggotaList.find(
      (a: any) => a.user.email === session?.user?.email
    );
    if (!anggota) return alert("Data anggota tidak ditemukan");

    await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anggotaId: anggota.id, bukuId }),
    });

    alert("Peminjaman berhasil!");
    fetch("/api/buku")
      .then((res) => res.json())
      .then((data) => setBukuList(data));
  };

  return (
    <div>
      <div className="bg-blue-50 rounded-xl p-10 text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Temukan Buku Favoritmu Hari Ini</h1>
        <p className="text-gray-700 mb-6">
          Jelajahi ribuan koleksi literatur, jurnal, dan referensi akademik.
        </p>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Cari judul buku atau nama pengarang..."
            className="border px-4 py-2 rounded-l w-96"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-r">
            Cari
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Koleksi Buku</h2>
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((buku) => (
          <div key={buku.id} className="bg-white rounded shadow p-4">
            <span className="text-xs text-gray-700">{buku.kategori}</span>
            <div className="bg-blue-100 h-32 rounded my-2" />
            <h3 className="font-semibold text-sm">{buku.judul}</h3>
            <p className="text-xs text-gray-700 mb-1">{buku.pengarang}</p>
            <p
              className={`text-xs mb-3 ${
                buku.stok > 0 ? "text-gray-700" : "text-red-500"
              }`}
            >
              Stok: {buku.stok > 0 ? buku.stok : "Habis"}
            </p>
            <button
              onClick={() => handlePinjam(buku.id)}
              disabled={buku.stok === 0}
              className={`w-full text-sm py-2 rounded ${
                buku.stok > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {buku.stok > 0 ? "Pinjam Buku" : "Sedang Dipinjam"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}