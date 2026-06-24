"use client";
import { useEffect, useState } from "react";

type Anggota = {
  id: number;
  nama: string;
  nim: string;
  user: { email: string };
};

export default function PendaftaranAnggota() {
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [form, setForm] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
  });

  const fetchAnggota = async () => {
    const res = await fetch("/api/anggota");
    const data = await res.json();
    setAnggotaList(data);
  };

  useEffect(() => {
    fetchAnggota();
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/anggota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ nama: "", nim: "", email: "", password: "" });
    fetchAnggota();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus anggota ini?")) return;
    await fetch("/api/anggota", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAnggota();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pendaftaran Anggota Baru</h1>
      <div className="bg-white p-6 rounded shadow max-w-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={form.nama}
            placeholder="Masukkan nama lengkap"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">NIM / NIDN</label>
          <input
            type="text"
            value={form.nim}
            placeholder="Contoh: 123456789"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, nim: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Alamat Email</label>
          <input
            type="email"
            value={form.email}
            placeholder="email@univ.edu"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            placeholder="Minimal 8 karakter"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setForm({ nama: "", nim: "", email: "", password: "" })}
            className="border px-4 py-2 rounded text-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Simpan Data
          </button>
        </div>
      </div>

      {/* Tabel Anggota */}
      <h2 className="text-lg font-semibold mb-3">Daftar Anggota</h2>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nama</th>
            <th className="p-3 text-left">NIM</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {anggotaList.map((anggota) => (
            <tr key={anggota.id} className="border-t">
              <td className="p-3">{anggota.id}</td>
              <td className="p-3 font-medium">{anggota.nama}</td>
              <td className="p-3">{anggota.nim}</td>
              <td className="p-3">{anggota.user.email}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(anggota.id)}
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