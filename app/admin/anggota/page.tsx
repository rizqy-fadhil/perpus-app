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
  const [showPassword, setShowPassword] = useState(false);

  const fetchAnggota = async () => {
    const res = await fetch("/api/anggota");
    const data = await res.json();
    setAnggotaList(data);
  };

  useEffect(() => {
    fetchAnggota();
  }, []);

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      alert("Alamat email harus menggunakan @");
      return;
    }

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
    try {
      const res = await fetch("/api/anggota", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal menghapus anggota");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus anggota");
    }
    fetchAnggota();
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Pendaftaran Anggota Baru</h1>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-10 max-w-3xl">
        {/* Nama Lengkap */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.nama}
            placeholder="Masukkan nama lengkap"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => {
              const val = e.target.value;
              // Maksimal 100 huruf dan tidak boleh angka
              if (/^[a-zA-Z\s]{0,100}$/.test(val)) {
                setForm({ ...form, nama: val });
              }
            }}
          />
        </div>

        {/* NIM / NIDN */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIM / NIDN
          </label>
          <input
            type="text"
            value={form.nim}
            placeholder="Contoh: 123456789"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => {
              const val = e.target.value;
              // Maksimal 9 digit dan hanya angka
              if (/^\d{0,9}$/.test(val)) {
                setForm({ ...form, nim: val });
              }
            }}
          />
        </div>

        {/* Alamat Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Email
          </label>
          <input
            type="email"
            value={form.email}
            placeholder="email@univ.edu"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              placeholder="Minimal 8 karakter"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                /* Eye Off Icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                /* Eye Icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm({ nama: "", nim: "", email: "", password: "" })}
            className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Simpan Data
          </button>
        </div>
      </div>

      {/* Tabel Anggota */}
      <h2 className="text-lg font-semibold mb-3 text-gray-900">Daftar Anggota</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIM</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {anggotaList.map((anggota) => (
              <tr key={anggota.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-gray-500">{anggota.id}</td>
                <td className="px-5 py-3.5 font-medium text-gray-800">{anggota.nama}</td>
                <td className="px-5 py-3.5 text-blue-600">{anggota.nim}</td>
                <td className="px-5 py-3.5 text-gray-600">{anggota.user?.email}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => handleDelete(anggota.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}