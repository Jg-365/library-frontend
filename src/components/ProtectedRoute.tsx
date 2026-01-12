import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import { AccessDeniedDialog } from "@/components/AccessDeniedDialog";
import type { PerfilUsuario } from "@/types/Usuario";

interface ProtectedRouteProps {
  children: React.ReactNode;
  perfisPermitidos: PerfilUsuario[];
}

export function ProtectedRoute({
  children,
  perfisPermitidos,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, role, isLoading } =
    useAuthContext();
  const [showAccessDenied, setShowAccessDenied] =
    useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-atlas-surface relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-slate-200">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize profile (backend may return `role` or legacy `perfil`)
  const currentPerfil =
    user?.role ?? user?.perfil ?? role ?? null;

  // Administrador tem acesso a todas as rotas
  if (currentPerfil === "ADMIN") {
    return <>{children}</>;
  }

  if (
    user &&
    currentPerfil &&
    !perfisPermitidos.includes(currentPerfil)
  ) {
    if (!showAccessDenied) {
      setShowAccessDenied(true);
    }

    return (
      <>
        <AccessDeniedDialog
          open={showAccessDenied}
          onClose={() => setShowAccessDenied(false)}
          message={`Esta página é restrita a ${perfisPermitidos.join(
            ", "
          )}. Seu perfil atual é ${currentPerfil}.`}
        />
        <div className="min-h-screen flex items-center justify-center cyber-atlas-surface relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
          <div className="text-center">
            <p className="text-xl text-gray-700 dark:text-slate-200">
              Redirecionando...
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}



