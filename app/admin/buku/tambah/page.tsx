"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TambahBukuRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/buku");
    }, [router]);

    return null;
}
