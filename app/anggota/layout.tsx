"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AnggotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [namaAnggota, setNamaAnggota] = useState("");

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/anggota")
      .then((res) => res.json())
      .then((list) => {
        const anggota = list.find(
          (a: any) => a.user.email === session?.user?.email
        );
        if (anggota) setNamaAnggota(anggota.nama);
      });
  }, [session]);

  const menus = [
    { label: "Katalog Buku", href: "/anggota/katalog" },
    { label: "Transaksi", href: "/anggota/transaksi" },
    { label: "Riwayat & Denda", href: "/anggota/riwayat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg
            className="w-7 h-7 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="text-blue-700 font-bold text-lg tracking-tight">
            Perpustakaan UNAIR
          </span>
        </div>

        {/* Menu Links */}
        <div className="flex gap-8">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`text-sm font-medium transition-colors pb-1 ${
                pathname === menu.href
                  ? "text-blue-700 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm uppercase border-2 border-blue-300">
            {namaAnggota ? namaAnggota.charAt(0) : "U"}
          </div>
          {/* Member Name */}
          <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate">
            {namaAnggota || "Anggota"}
          </span>
          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 ml-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}