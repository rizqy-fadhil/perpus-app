"use client";
import { useEffect, useState } from "react";

type Buku = {
    id: number;
    judul: string;
    pengarang: string;
    kategori: string;
    stok: number;
};

type BukuForm = {
    judul: string;
    pengarang: string;
    kategori: string;
    stok: string;
};

const KATEGORI_OPTIONS = [
    "Umum",
    "Referensi",
    "Fiksi",
    "Non-Fiksi",
    "Karya Ilmiah",
];

const MAX_STOK = 100;
const PAGE_SIZE = 10;

const emptyForm: BukuForm = {
    judul: "",
    pengarang: "",
    kategori: "",
    stok: "",
};

function parseStok(value: string): number {
    if (value.trim() === "") return 0;
    return parseInt(value, 10);
}

function validateForm(form: BukuForm): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.judul.trim()) errors.judul = "Judul buku wajib diisi";
    if (!form.pengarang.trim()) errors.pengarang = "Pengarang wajib diisi";
    const stok = parseStok(form.stok);
    if (stok > MAX_STOK) errors.stok = `Stok maksimal ${MAX_STOK}`;
    if (stok < 0) errors.stok = "Stok tidak boleh negatif";
    return errors;
}

function toPayload(form: BukuForm) {
    return {
        judul: form.judul.trim(),
        pengarang: form.pengarang.trim(),
        kategori: form.kategori,
        stok: parseStok(form.stok),
    };
}

function BukuModal({
    title,
    form,
    setForm,
    errors,
    onClose,
    onSubmit,
    submitLabel,
}: {
    title: string;
    form: BukuForm;
    setForm: (form: BukuForm) => void;
    errors: Record<string, string>;
    onClose: () => void;
    onSubmit: () => void;
    submitLabel: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Judul Buku <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.judul}
                            placeholder="Masukkan judul buku lengkap"
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-1 ${
                                errors.judul
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            }`}
                            onChange={(e) => setForm({ ...form, judul: e.target.value })}
                        />
                        {errors.judul && (
                            <p className="mt-1 text-xs text-red-500">{errors.judul}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Pengarang <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.pengarang}
                                placeholder="Nama pengarang utama"
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-1 ${
                                    errors.pengarang
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                                onChange={(e) => setForm({ ...form, pengarang: e.target.value })}
                            />
                            {errors.pengarang && (
                                <p className="mt-1 text-xs text-red-500">{errors.pengarang}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Kategori
                            </label>
                            <div className="relative">
                                <select
                                    value={form.kategori}
                                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {KATEGORI_OPTIONS.map((kat) => (
                                        <option key={kat} value={kat}>
                                            {kat}
                                        </option>
                                    ))}
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Stok Buku
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={form.stok}
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-1 ${
                                errors.stok
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            }`}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                    setForm({ ...form, stok: "" });
                                    return;
                                }
                                if (!/^\d+$/.test(val)) return;
                                if (parseInt(val, 10) > MAX_STOK) return;
                                setForm({ ...form, stok: val });
                            }}
                        />
                        {errors.stok && (
                            <p className="mt-1 text-xs text-red-500">{errors.stok}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onSubmit}
                        className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ManajemenBuku() {
    const [bukuList, setBukuList] = useState<Buku[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<BukuForm>(emptyForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const fetchBuku = async () => {
        const res = await fetch("/api/buku");
        const data = await res.json();
        setBukuList(data);
    };

    useEffect(() => {
        fetchBuku();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin hapus buku ini?")) return;
        await fetch("/api/buku", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchBuku();
    };

    const openAddModal = () => {
        setForm(emptyForm);
        setFormErrors({});
        setShowAddModal(true);
    };

    const openEditModal = (buku: Buku) => {
        setEditId(buku.id);
        setForm({
            judul: buku.judul,
            pengarang: buku.pengarang,
            kategori: buku.kategori,
            stok: String(buku.stok),
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditId(null);
        setForm(emptyForm);
        setFormErrors({});
    };

    const handleAdd = async () => {
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        const res = await fetch("/api/buku", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toPayload(form)),
        });
        if (!res.ok) {
            const data = await res.json();
            if (data.errors) setFormErrors(data.errors);
            return;
        }
        closeModals();
        fetchBuku();
    };

    const handleEdit = async () => {
        if (editId === null) return;
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        const res = await fetch("/api/buku", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editId, ...toPayload(form) }),
        });
        if (!res.ok) {
            const data = await res.json();
            if (data.errors) setFormErrors(data.errors);
            return;
        }
        closeModals();
        fetchBuku();
    };

    const filtered = bukuList.filter(
        (b) =>
            b.judul.toLowerCase().includes(search.toLowerCase()) ||
            b.pengarang.toLowerCase().includes(search.toLowerCase())
    );

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
    const paginated = filtered.slice(startIndex, endIndex);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Manajemen Data Buku
            </h1>

            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari judul atau pengarang..."
                        value={search}
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    + Tambah Buku Baru
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    ID Buku
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Judul Buku
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Pengarang
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Kategori
                                </th>
                                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Stok
                                </th>
                                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginated.map((buku) => (
                                <tr key={buku.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        BU{String(buku.id).padStart(2, "0")}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-semibold">
                                        {buku.judul}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {buku.pengarang}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                            {buku.kategori}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-700 font-semibold text-sm">
                                            {buku.stok}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(buku)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                aria-label="Edit buku"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(buku.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                aria-label="Hapus buku"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        {search ? "Tidak ada buku yang cocok dengan pencarian" : "Belum ada data buku"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        {totalItems > 0
                            ? `Menampilkan ${startIndex + 1} hingga ${endIndex} dari ${totalItems} data`
                            : "Menampilkan 0 data"}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Sebelumnya
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                    p === currentPage
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <BukuModal
                    title="Tambah Data Buku"
                    form={form}
                    setForm={(next) => {
                        setForm(next);
                        setFormErrors({});
                    }}
                    errors={formErrors}
                    onClose={closeModals}
                    onSubmit={handleAdd}
                    submitLabel="Simpan Data"
                />
            )}

            {showEditModal && (
                <BukuModal
                    title="Edit Data Buku"
                    form={form}
                    setForm={(next) => {
                        setForm(next);
                        setFormErrors({});
                    }}
                    errors={formErrors}
                    onClose={closeModals}
                    onSubmit={handleEdit}
                    submitLabel="Simpan Data"
                />
            )}
        </div>
    );
}
