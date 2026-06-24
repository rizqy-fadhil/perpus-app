"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menus = [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Manajemen Data Buku", href: "/admin/buku" },
        { label: "Pendaftaran Anggota", href: "/admin/anggota" },
        { label: "Laporan Transaksi", href: "/admin/laporan" },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-60 bg-white border-r flex flex-col p-4">
                <h1 className="text-blue-600 font-bold text-lg mb-1">Perpustakaan UNAIR</h1>
                <p className="text-xs text-black mb-6">Admin Dashboard</p>
                <nav className="flex flex-col gap-2 flex-1">
                    {menus.map((menu) => (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`px-3 py-2 rounded text-sm ${pathname === menu.href
                                ? "text-blue-600 border-l-4 border-blue-600 font-semibold"
                                : "text-black hover:bg-gray-100"
                                }`}
                        >
                            {menu.label}
                        </Link>
                    ))}
                </nav>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm text-black hover:text-red-500 text-left px-3 py-2"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 p-8">{children}</main>
        </div>
    );
}