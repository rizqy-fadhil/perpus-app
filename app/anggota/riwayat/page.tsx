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

const ITEMS_PER_PAGE = 5;

// Warning triangle icon
function WarningIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Filter icon
function FilterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

export default function RiwayatDenda() {
  const { data: session } = useSession();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [totalDenda, setTotalDenda] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showFilter, setShowFilter] = useState(false);

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

  // Check if a transaction is late
  const isLate = (t: Transaksi) => {
    if (t.status === "SELESAI") return false;
    const batas = new Date(t.batasKembali);
    const today = new Date();
    return today > batas;
  };

  // Get display status
  const getDisplayStatus = (t: Transaksi) => {
    if (t.status === "SELESAI") return "Selesai";
    if (isLate(t)) return "Terlambat";
    if (t.status === "DIPINJAM") return "Sedang Dipinjam";
    return t.status;
  };

  // Get status style
  const getStatusStyle = (t: Transaksi) => {
    const status = getDisplayStatus(t);
    switch (status) {
      case "Selesai":
        return { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border border-green-200" };
      case "Terlambat":
        return { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50 border border-red-200" };
      case "Sedang Dipinjam":
        return { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50 border border-blue-200" };
      default:
        return { dot: "bg-gray-500", text: "text-gray-700", bg: "bg-gray-50 border border-gray-200" };
    }
  };

  // Format date as YYYY-MM-DD
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  };

  // Filter transaksi
  const filteredList = filterStatus === "ALL"
    ? transaksiList
    : transaksiList.filter((t) => {
        if (filterStatus === "TERLAMBAT") return isLate(t) && t.status !== "SELESAI";
        return t.status === filterStatus;
      });

  // Pagination
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedList = filteredList.slice(startIdx, endIdx);
  const showingFrom = filteredList.length > 0 ? startIdx + 1 : 0;
  const showingTo = Math.min(endIdx, filteredList.length);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">
        Riwayat Peminjaman & Denda
      </h1>

      {/* Status Denda Banner */}
      {totalDenda > 0 && (
        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <WarningIcon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Status Denda
              </p>
              <p className="text-lg font-bold text-gray-900">
                Total Tagihan Denda Anda Saat Ini:{" "}
                <span className="text-red-500">
                  Rp {totalDenda.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          </div>
          <button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            Bayar Denda
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Daftar Transaksi</h2>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
            >
              <FilterIcon className="w-4 h-4" />
              Filter
            </button>
            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[180px] py-1">
                {[
                  { value: "ALL", label: "Semua" },
                  { value: "SELESAI", label: "Selesai" },
                  { value: "DIPINJAM", label: "Sedang Dipinjam" },
                  { value: "TERLAMBAT", label: "Terlambat" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilterStatus(opt.value);
                      setCurrentPage(1);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filterStatus === opt.value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Judul Buku
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tgl Pinjam
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batas Kembali
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Denda
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((t) => {
                const style = getStatusStyle(t);
                const late = isLate(t);
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      TR{String(t.id).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {t.buku.judul}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(t.tglPinjam)}
                    </td>
                    <td className={`px-6 py-4 ${late ? "text-red-500 font-medium" : "text-gray-600"}`}>
                      {formatDate(t.batasKembali)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                        {getDisplayStatus(t)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${t.denda > 0 ? "text-red-500" : "text-gray-600"}`}>
                      {t.denda > 0
                        ? `Rp ${t.denda.toLocaleString("id-ID")}`
                        : "Rp 0"}
                    </td>
                  </tr>
                );
              })}
              {paginatedList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Tidak ada data transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Menampilkan {showingFrom} hingga {showingTo} dari {filteredList.length} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3.5 py-1.5 text-sm rounded-lg border transition-colors ${
                currentPage === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 text-sm rounded-lg border transition-colors font-medium ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3.5 py-1.5 text-sm rounded-lg border transition-colors ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}