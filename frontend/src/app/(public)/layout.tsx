import { LuxuryHeader } from "@/components/luxury/LuxuryHeader";
import { LuxuryFooter } from "@/components/luxury/LuxuryFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LuxuryHeader />
      <main className="flex-1">
        {children}
      </main>
      <LuxuryFooter />
    </div>
  );
}
