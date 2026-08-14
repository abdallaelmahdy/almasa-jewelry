"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

export function Header() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button (placeholder for actual mobile sidebar logic if needed) */}
      <button type="button" className="-m-2.5 p-2.5 text-foreground md:hidden">
        <span className="sr-only">فتح القائمة</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 ms-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </header>
  );
}
