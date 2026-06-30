"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Buku = { id: number; judul: string; stok: number };
type Transaksi = {
  id: number;
  bukuId: number;
  buku: { judul: string };
  tglPinjam: string;
  batasKembali: string;
  status: string;
};

const DENDA_PER_HARI = 2500;

// Calendar icon component
function CalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

// Search icon component
function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

// Check circle icon component
function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

// Info icon component
function InfoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  detail,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  detail?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-[modalIn_0.3s_ease-out]">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{message}</p>
        {detail && (
          <p className="text-xs text-gray-400 mb-6">{detail}</p>
        )}
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-[modalIn_0.3s_ease-out]">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Gagal</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
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

export default function TransaksiPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"pinjam" | "kembali">("pinjam");
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [transaksiAktif, setTransaksiAktif] = useState<Transaksi[]>([]);
  const [anggotaId, setAnggotaId] = useState<number | null>(null);
  const [selectedBuku, setSelectedBuku] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState("");
  const [borrowedBookIds, setBorrowedBookIds] = useState<Set<number>>(new Set());

  // Modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetail, setSuccessDetail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTransaksiAktif = (id: number) => {
    fetch(`/api/transaksi?anggotaId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const aktif = data.filter((t: any) => t.status === "DIPINJAM");
        setTransaksiAktif(aktif);
        setBorrowedBookIds(new Set(aktif.map((t: any) => t.bukuId)));
      });
  };

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
        fetchTransaksiAktif(anggota.id);
      });
  }, [session]);

  const handlePinjam = async () => {
    if (!selectedBuku || !anggotaId) return;

    const result = await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anggotaId, bukuId: parseInt(selectedBuku) }),
    });

    if (!result.ok) {
      const data = await result.json();
      setErrorMessage(data.error || "Terjadi kesalahan saat meminjam buku.");
      setShowError(true);
      return;
    }

    const bukuTerpilih = bukuList.find((b) => b.id === parseInt(selectedBuku));
    setSuccessTitle("Peminjaman Berhasil! 🎉");
    setSuccessMessage(`Anda telah berhasil meminjam buku "${bukuTerpilih?.judul || ""}".`);
    setSuccessDetail("Batas pengembalian: 7 hari dari sekarang. Keterlambatan akan dikenakan denda.");
    setShowSuccess(true);
    setSelectedBuku("");

    // Refresh data
    fetch("/api/buku").then((r) => r.json()).then(setBukuList);
    fetchTransaksiAktif(anggotaId);
  };

  const handleKembali = async () => {
    if (!selectedTransaksi || !anggotaId) return;

    const trx = transaksiAktif.find((t) => t.id === parseInt(selectedTransaksi));

    await fetch("/api/transaksi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(selectedTransaksi) }),
    });

    setSuccessTitle("Pengembalian Berhasil! 📚");
    setSuccessMessage(`Buku "${trx?.buku.judul || ""}" telah berhasil dikembalikan.`);
    setSuccessDetail("Terima kasih telah mengembalikan buku tepat waktu.");
    setShowSuccess(true);
    setSelectedTransaksi("");

    // Refresh data
    fetch("/api/buku").then((r) => r.json()).then(setBukuList);
    fetchTransaksiAktif(anggotaId);
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

  // Calculate late status for selected transaksi
  const selectedTrx = transaksiAktif.find(
    (t) => t.id === parseInt(selectedTransaksi)
  );
  const getLateInfo = () => {
    if (!selectedTrx) return null;
    const batas = new Date(selectedTrx.batasKembali);
    const today = new Date();
    const selisihHari = Math.floor(
      (today.getTime() - batas.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (selisihHari > 0) {
      const denda = selisihHari * DENDA_PER_HARI;
      return {
        late: true,
        days: selisihHari,
        denda,
        text: `Terlambat ${selisihHari} Hari (Denda: Rp ${denda.toLocaleString("id-ID")})`,
      };
    }
    return { late: false, days: 0, denda: 0, text: "Tidak ada keterlambatan" };
  };
  const lateInfo = getLateInfo();

  // Filter out books that user has already borrowed
  const availableBuku = bukuList.filter(
    (b) => b.stok > 0 && !borrowedBookIds.has(b.id)
  );

  return (
    <div className="max-w-2xl mx-auto pt-4">
      {/* Modals */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successTitle}
        message={successMessage}
        detail={successDetail}
      />
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />

      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 tracking-tight">
        Sirkulasi Perpustakaan
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Lakukan peminjaman atau pengembalian buku Anda di sini.
      </p>

      {/* Card Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setTab("pinjam"); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${
              tab === "pinjam"
                ? "text-blue-600 border-b-[3px] border-blue-600 bg-white"
                : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
            }`}
          >
            Peminjaman Buku
          </button>
          <button
            onClick={() => { setTab("kembali"); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${
              tab === "kembali"
                ? "text-blue-600 border-b-[3px] border-blue-600 bg-white"
                : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
            }`}
          >
            Pengembalian Buku
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {tab === "pinjam" ? (
            <>
              {/* Pilih Buku */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Pilih Buku
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={selectedBuku}
                    onChange={(e) => setSelectedBuku(e.target.value)}
                    className="w-full border border-gray-200 pl-10 pr-10 py-3 rounded-xl text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition text-gray-700"
                  >
                    <option value="">Pilih judul buku dari katalog...</option>
                    {availableBuku.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.judul}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
                {/* Currently borrowed notice */}
                {borrowedBookIds.size > 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Buku yang sudah Anda pinjam tidak ditampilkan dalam daftar.
                  </p>
                )}
              </div>

              {/* Date Fields */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Tanggal Pinjam
                  </label>
                  <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                    <CalendarIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tglHariIni}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Batas Pengembalian{" "}
                    <span className="text-gray-400 font-normal">(7 Hari)</span>
                  </label>
                  <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                    <CalendarIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tglBatas}</span>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 mb-8 flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pastikan buku yang Anda pilih sesuai. Keterlambatan pengembalian akan dikenakan denda sesuai peraturan perpustakaan.
                </p>
              </div>

              {/* Pinjam Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePinjam}
                  disabled={!selectedBuku}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedBuku
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-blue-200 text-blue-50 cursor-not-allowed"
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Pinjam
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Buku yang Dikembalikan */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Buku yang Dikembalikan
                </label>
                <div className="relative">
                  <select
                    value={selectedTransaksi}
                    onChange={(e) => setSelectedTransaksi(e.target.value)}
                    className="w-full border border-gray-200 px-4 pr-10 py-3 rounded-xl text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition text-gray-700"
                  >
                    <option value="">Pilih buku yang sedang dipinjam...</option>
                    {transaksiAktif.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.buku.judul} (Dipinjam:{" "}
                        {new Date(t.tglPinjam).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        )
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tanggal Pengembalian & Status Keterlambatan */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Tanggal Pengembalian
                  </label>
                  <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                    <CalendarIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tglHariIni}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Status Keterlambatan
                  </label>
                  <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                      !selectedTransaksi
                        ? "bg-gray-50 border-gray-100"
                        : lateInfo?.late
                        ? "bg-red-50/70 border-red-100"
                        : "bg-green-50/70 border-green-100"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        !selectedTransaksi
                          ? "text-gray-400"
                          : lateInfo?.late
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {!selectedTransaksi
                        ? "Pilih buku terlebih dahulu"
                        : lateInfo?.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 mb-8 flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pastikan buku dikembalikan dalam kondisi baik dan utuh seperti saat dipinjam. Denda akan otomatis ditagihkan ke akun Anda jika melewati batas waktu.
                </p>
              </div>

              {/* Kembalikan Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleKembali}
                  disabled={!selectedTransaksi}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedTransaksi
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-blue-200 text-blue-50 cursor-not-allowed"
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Kembalikan
                </button>
              </div>
            </>
          )}
        </div>
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