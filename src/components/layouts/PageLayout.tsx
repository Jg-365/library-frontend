import type { Perfil } from "@/types";

interface PageLayoutProps {
  perfil?: Perfil;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

// PageLayout agora assume que o `AppHeader` é renderizado globalmente
// no nível da aplicação (por exemplo em `App.tsx`). Isso evita
// lógica runtime que causava flicker do header durante montagem.
export function PageLayout({
  title,
  children,
  className = "container mx-auto px-4 py-8 pb-24 lg:pb-8",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className={className}>{children}</main>
    </div>
  );
}
