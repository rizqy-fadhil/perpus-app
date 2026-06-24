"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Buku = {
    id: number;
    judul: string;
    pengarang: string;
    kategori: string;
    stok: number;
};

export default function ManajemenBuku() {
    const [bukuList, setBukuList] = useState<Buku[]>([]);
    const [search, setSearch] = useState("");

    const fetchBuku = async () => {
    const res = await fetch("/api/buku");
    const data = await res.json();
    setBukuList(data);
};

useEffect(() => {
    fetchBuku();
}, []);

const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus buku ini?")) return;
    await fetch("/api/buku", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    fetchBuku();
};

const filtered = bukuList.filter(
    (b) =>
        b.judul.toLowerCase().includes(search.toLowerCase()) ||
        b.pengarang.toLowerCase().includes(search.toLowerCase())
);

return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Manajemen Data Buku</h1>
        <div className="flex justify-between mb-4">
        <input
            type="text"
            placeholder="Cari judul atau pengarang..."
            className="border px-4 py-2 rounded w-72"
            onChange={(e) => setSearch(e.target.value)}
        />
        <Link
            href="/admin/buku/tambah"
            className="bg-blue-600 text-white px-4 py-2 rounded"
        >
        + Tambah Buku Baru
        </Link>
    </div>
    <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Judul Buku</th>
            <th className="p-3 text-left">Pengarang</th>
            <th className="p-3 text-left">Kategori</th>
            <th className="p-3 text-left">Stok</th>
            <th className="p-3 text-left">Aksi</th>
        </tr>
        </thead>
        <tbody>
            {filtered.map((buku) => (
            <tr key={buku.id} className="border-t">
                <td className="p-3">BU0{buku.id}</td>
                <td className="p-3 font-medium">{buku.judul}</td>
                <td className="p-3">{buku.pengarang}</td>
                <td className="p-3">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {buku.kategori}
                </span>
            </td>
            <td className="p-3">{buku.stok}</td>
            <td className="p-3 flex gap-2">
                <Link
                    href={`/admin/buku/edit/${buku.id}`}
                    className="text-blue-500 hover:underline"
                >
                    Edit
                </Link>
                <button
                    onClick={() => handleDelete(buku.id)}
                    className="text-red-500 hover:underline"
                >
                    Hapus
                </button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
);
}