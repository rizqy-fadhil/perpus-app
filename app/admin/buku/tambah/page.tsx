"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahBuku() {
  const router = useRouter();
  const [form, setForm] = useState({
    judul: "",
    pengarang: "",
    kategori: "",
    stok: 0,
  });

  const handleSubmit = async () => {
    await fetch("/api/buku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/buku");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tambah Buku Baru</h1>
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Judul Buku</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Pengarang</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, pengarang: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Stok</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) =>
              setForm({ ...form, stok: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push("/admin/buku")}
            className="border px-4 py-2 rounded text-black"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}