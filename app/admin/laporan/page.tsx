"use client";
import { useEffect, useState } from "react";

type Transaksi = {
  id: number;
  anggota: { nama: string };
  buku: { judul: string };
  tglPinjam: string;
  tglKembali: string | null;
  denda: number;
  status: string;
};

const ITEMS_PER_PAGE = 5;

const statusLabel: Record<string, string> = {
  DIPINJAM: "Dipinjam",
  SELESAI: "Selesai",
  TERLAMBAT: "Terlambat",
};

const statusColor: Record<string, string> = {
  DIPINJAM: "bg-yellow-400 text-white",
  SELESAI: "bg-gray-200 text-gray-700",
  TERLAMBAT: "bg-red-500 text-white",
};

function formatTanggal(dateStr: string): string {
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
  ];
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export default function LaporanTransaksi() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/transaksi")
      .then((res) => res.json())
      .then((data) => setTransaksi(data));
  }, []);

  const totalPages = Math.max(1, Math.ceil(transaksi.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = transaksi.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const showingFrom = transaksi.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + ITEMS_PER_PAGE, transaksi.length);

  // Build page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">
        Laporan Transaksi
      </h1>

      {/* Filter & Print Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Periode:</span>
          <select className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 cursor-pointer"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}
          >
            <option>Semua Waktu</option>
          </select>
        </div>
        <button
          onClick={() => window.print()}
          className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Cetak Laporan
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {/* Blue Header */}
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID Transaksi</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nama Anggota</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Judul Buku</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tgl Pinjam</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tgl Kembali</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Denda</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              paginatedData.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-500">TR0{t.id}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800">{t.anggota.nama}</td>
                  <td className="px-5 py-4 text-gray-600">{t.buku.judul}</td>
                  <td className="px-5 py-4 text-gray-600">{formatTanggal(t.tglPinjam)}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {t.tglKembali ? formatTanggal(t.tglKembali) : "-"}
                  </td>
                  <td className="px-5 py-4">
                    {t.denda > 0 ? (
                      <span className="text-red-500 font-medium">
                        Rp {t.denda.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-gray-600">Rp 0</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor[t.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {statusLabel[t.status] || t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {transaksi.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Menampilkan {showingFrom} hingga {showingTo} dari {transaksi.length} data
            </p>
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}