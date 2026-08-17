"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { User } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, clearAuth, setInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Attempt to fetch current user
        // If we don't have an access token in memory, this will 401.
        // The Axios response interceptor will then automatically attempt a /auth/refresh
        // If the refresh succeeds, it will retry this request and succeed.
        const { data } = await api.get<User>("/users/me");
        if (mounted) {
          // Note: The interceptor sets the accessToken in Zustand directly on refresh,
          // but we can just use the current token in state here.
          const currentToken = useAuthStore.getState().accessToken;
          setAuth(data, currentToken || "");
        }
      } catch (error) {
        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      initAuth();
    }

    return () => {
      mounted = false;
    };
  }, [isInitialized, setAuth, clearAuth, setInitialized]);

  useEffect(() => {
    // Route protection logic
    if (isInitialized) {
      const isPublicRoute = pathname === "/" || pathname === "/login";

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/dashboard");
      }

      // Add strict RBAC protection
      if (user && user.role === "employee") {
        if (
          pathname.startsWith("/reports") ||
          pathname.startsWith("/audit") ||
          pathname.startsWith("/settings")
        ) {
          router.push("/dashboard");
        }
      }
    }
  }, [isInitialized, user, pathname, router]);

  if (!isMounted) {
    return <>{children}</>;
  }

  if (!isInitialized) {
    // Show a loading state matching Dark Luxury while auth resolves
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]" suppressHydrationWarning>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#c5a059] font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
