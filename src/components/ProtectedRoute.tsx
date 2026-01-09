import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
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
  const { isAuthenticated, user, isLoading } = useAuth();
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

  if (user && !perfisPermitidos.includes(user.perfil)) {
    if (!showAccessDenied) {
      setShowAccessDenied(true);
    }

    return (
      <>
        <AccessDeniedDialog
          open={showAccessDenied}
          onClose={() => setShowAccessDenied(false)}
          message={`Esta página é restrita a ${perfisPermitidos.join(", ")}. Seu perfil atual é ${user.perfil}.`}
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
