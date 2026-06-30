"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Buku = { id: number; judul: string; stok: number };
type Transaksi = {
  id: number;
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

export default function TransaksiPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"pinjam" | "kembali">("pinjam");
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [transaksiAktif, setTransaksiAktif] = useState<Transaksi[]>([]);
  const [anggotaId, setAnggotaId] = useState<number | null>(null);
  const [selectedBuku, setSelectedBuku] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState("");
  const [pesan, setPesan] = useState("");

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
        fetch(`/api/transaksi?anggotaId=${anggota.id}`)
          .then((r) => r.json())
          .then((data) =>
            setTransaksiAktif(data.filter((t: any) => t.status === "DIPINJAM"))
          );
      });
  }, [session]);

  const handlePinjam = async () => {
    if (!selectedBuku || !anggotaId) return;
    await fetch("/api/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anggotaId, bukuId: parseInt(selectedBuku) }),
    });
    setPesan("Peminjaman berhasil!");
    setSelectedBuku("");
  };

  const handleKembali = async () => {
    if (!selectedTransaksi) return;
    await fetch("/api/transaksi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(selectedTransaksi) }),
    });
    setPesan("Pengembalian berhasil!");
    setSelectedTransaksi("");
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

  return (
    <div className="max-w-2xl mx-auto pt-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 tracking-tight">
        Sirkulasi Perpustakaan
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Lakukan peminjaman atau pengembalian buku Anda di sini.
      </p>

      {/* Success Message */}
      {pesan && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
          {pesan}
        </div>
      )}

      {/* Card Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setTab("pinjam"); setPesan(""); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${
              tab === "pinjam"
                ? "text-blue-600 border-b-[3px] border-blue-600 bg-white"
                : "text-gray-400 hover:text-gray-600 bg-gray-50/50"
            }`}
          >
            Peminjaman Buku
          </button>
          <button
            onClick={() => { setTab("kembali"); setPesan(""); }}
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
                    {bukuList
                      .filter((b) => b.stok > 0)
                      .map((b) => (
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
    </div>
  );
}