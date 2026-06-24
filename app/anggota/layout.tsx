"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AnggotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menus = [
    { label: "Katalog Buku", href: "/anggota/katalog" },
    { label: "Transaksi", href: "/anggota/transaksi" },
    { label: "Riwayat & Denda", href: "/anggota/riwayat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <span className="text-blue-600 font-bold text-lg">
          Perpustakaan UNAIR
        </span>
        <div className="flex gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`text-sm ${
                pathname === menu.href
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-700 hover:text-red-500"
        >
          Logout
        </button>
      </nav>

      {/* Content */}
      <main className="p-8">{children}</main>
    </div>
  );
}