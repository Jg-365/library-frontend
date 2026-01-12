import { cn } from "@/lib/utils";
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
  className = "max-w-6xl px-4 pt-24 pb-10 lg:px-8 lg:pt-28 lg:pb-12",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen relative cyber-atlas-surface">
      <main
        className={cn(
          "mx-auto w-full space-y-6",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}



