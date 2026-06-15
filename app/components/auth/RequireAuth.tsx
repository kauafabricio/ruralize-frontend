"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }

    const queryString =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).toString();
    const nextPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [pathname, router, status]);

  if (status === "loading" || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-white" aria-label="Carregando sessão" />
    );
  }

  return <>{children}</>;
}
