"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditBukuRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/buku");
    }, [router]);

    return null;
}
