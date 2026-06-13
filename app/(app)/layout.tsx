"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/token-store";
import Navbar from "@/components/navbar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60, minHeight: "100vh" }}>
        {children}
      </main>
    </>
  );
}
