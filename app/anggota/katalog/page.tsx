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

type TransaksiAktif = {
  bukuId: number;
};

// Category color mapping for badges
const kategoriColors: Record<string, { bg: string; text: string }> = {
  Pemrograman: { bg: "bg-blue-100", text: "text-blue-700" },
  Kedokteran: { bg: "bg-purple-100", text: "text-purple-700" },
  Sejarah: { bg: "bg-amber-100", text: "text-amber-700" },
  Ekonomi: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Karya Ilmiah": { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Non-Fiksi": { bg: "bg-teal-100", text: "text-teal-700" },
  Fiksi: { bg: "bg-pink-100", text: "text-pink-700" },
  Referensi: { bg: "bg-orange-100", text: "text-orange-700" },
  Umum: { bg: "bg-gray-100", text: "text-gray-700" },
};

function getKategoriColor(kategori: string) {
  return kategoriColors[kategori] || { bg: "bg-slate-100", text: "text-slate-700" };
}

// Generate a consistent pseudo-random rating based on book id
function getRating(id: number) {
  const ratings = [4.2, 4.5, 4.8, 4.9, 4.3, 4.6, 4.7, 4.1, 4.4, 5.0];
  return ratings[id % ratings.length];
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  bookTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-[modalIn_0.3s_ease-out]">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Peminjaman Berhasil! 🎉
        </h3>
        {/* Description */}
        <p className="text-sm text-gray-500 mb-2">
          Anda telah berhasil meminjam buku:
        </p>
        <p className="text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg px-4 py-2 mb-4 inline-block">
          {bookTitle}
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Batas pengembalian: <span className="font-medium text-gray-600">7 hari</span> dari sekarang. Keterlambatan akan dikenakan denda.
        </p>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

// Error Modal Component
function ErrorModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-[modalIn_0.3s_ease-out]">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Peminjaman Gagal
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default function KatalogBuku() {
  const { data: session } = useSession();
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [borrowedBookIds, setBorrowedBookIds] = useState<Set<number>>(new Set());
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);

  // Modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successBookTitle, setSuccessBookTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = () => {
    fetch("/api/buku")
      .then((res) => res.json())
      .then((data) => setBukuList(data));
  };

  const fetchBorrowedBooks = () => {
    if (!session?.user?.email) return;
    fetch("/api/anggota")
      .then((res) => res.json())
      .then((anggotaList) => {
        const anggota = anggotaList.find(
          (a: any) => a.user.email === session?.user?.email
        );
        if (!anggota) return;
        fetch(`/api/transaksi?anggotaId=${anggota.id}`)
          .then((res) => res.json())
          .then((data) => {
            const activeIds = new Set<number>(
              data
                .filter((t: any) => t.status === "DIPINJAM")
                .map((t: any) => t.bukuId)
            );
            setBorrowedBookIds(activeIds);
          });
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBorrowedBooks();
  }, [session]);

  const filtered = bukuList.filter(
    (b) =>
      b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.pengarang.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = showAll ? filtered : filtered.slice(0, 4);

  const handlePinjam = async (buku: Buku) => {
    const res = await fetch("/api/anggota");
    const anggotaList = await res.json();
    const anggota = anggotaList.find(
      (a: any) => a.user.email === session?.user?.email
    );
    if (!anggota) {
      setErrorMessage("Data anggota tidak ditemukan.");
      setShowError(true);
      return;
    }

    setLoadingBookId(buku.id);

    const result = await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anggotaId: anggota.id, bukuId: buku.id }),
    });

    setLoadingBookId(null);

    if (!result.ok) {
      const data = await result.json();
      setErrorMessage(data.error || "Terjadi kesalahan saat meminjam buku.");
      setShowError(true);
      return;
    }

    // Success
    setSuccessBookTitle(buku.judul);
    setShowSuccess(true);
    fetchData();
    fetchBorrowedBooks();
  };

  const isBorrowed = (bukuId: number) => borrowedBookIds.has(bukuId);

  return (
    <div>
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        bookTitle={successBookTitle}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl px-10 pt-12 pb-10 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Temukan Buku Favoritmu Hari Ini
        </h1>
        <p className="text-gray-500 mb-8 text-base max-w-lg mx-auto">
          Jelajahi ribuan koleksi literatur, jurnal, dan referensi akademik di perpustakaan kami.
        </p>

        {/* Book Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-28 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari judul buku atau nama pengarang..."
              className="w-full border border-gray-200 pl-12 pr-28 py-3 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition"
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Koleksi Terbaru</h2>
        {!showAll && filtered.length > 4 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            Tampilkan Sedikit
          </button>
        )}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayed.map((buku) => {
          const color = getKategoriColor(buku.kategori);
          const rating = getRating(buku.id);
          const borrowed = isBorrowed(buku.id);
          const outOfStock = buku.stok === 0;
          const isDisabled = borrowed || outOfStock;
          const isLoading = loadingBookId === buku.id;

          return (
            <div
              key={buku.id}
              className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col ${
                borrowed ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"
              }`}
            >
              {/* Book Cover */}
              <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 h-40 flex items-center justify-center">
                {/* Category Badge */}
                <span
                  className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-md ${color.bg} ${color.text}`}
                >
                  {buku.kategori}
                </span>
                {/* Borrowed Badge */}
                {borrowed && (
                  <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Dipinjam
                  </span>
                )}
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              {/* Book Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-2 leading-snug">
                  {buku.judul}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{buku.pengarang}</p>

                {/* Stock & Rating */}
                <div className="flex items-center justify-between text-xs mb-4 mt-auto">
                  {buku.stok > 0 ? (
                    <span className="flex items-center gap-1 text-gray-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      Stok: {buku.stok}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      Stok: Habis
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-gray-600">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating}
                  </span>
                </div>

                {/* Pinjam Button */}
                <button
                  onClick={() => handlePinjam(buku)}
                  disabled={isDisabled || isLoading}
                  className={`w-full text-sm py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    isLoading
                      ? "bg-blue-400 text-white cursor-wait"
                      : borrowed
                      ? "bg-amber-50 text-amber-600 cursor-not-allowed border border-amber-200"
                      : buku.stok > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </>
                  ) : borrowed ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Sudah Dipinjam
                    </>
                  ) : buku.stok > 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      Pinjam Buku
                    </>
                  ) : (
                    "Stok Habis"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS Animation for Modal */}
      <style jsx global>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}