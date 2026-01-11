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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">
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
  const currentPerfil = role;

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <p className="text-xl text-gray-700">
              Redirecionando...
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
