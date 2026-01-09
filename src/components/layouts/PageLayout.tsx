import { AppHeader } from "./AppHeader";
import type { Perfil } from "@/types";

interface PageLayoutProps {
  perfil: Perfil;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  perfil,
  title,
  children,
  className = "container mx-auto px-4 py-8",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <AppHeader perfil={perfil} title={title} />
      <main className={className}>{children}</main>
    </div>
  );
}
