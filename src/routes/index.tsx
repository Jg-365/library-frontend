import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { privateRoutes } from "@/routes/privateRoutes";
import { publicRoutes } from "@/routes/publicRoutes";
import { AppHeader } from "@/components/layouts/AppHeader";
import { useAuth } from "@/store/AuthContext";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
}

function RouterContent() {
  const location = useLocation();
  const { role, user } = useAuth();

  // Derive perfil from user object with fallbacks
  const perfil =
    user?.role ?? user?.perfil ?? role ?? "USUARIO";

  // Hide header on auth pages
  const hideHeaderPaths = ["/login", "/register"];
  const showHeader = !hideHeaderPaths.includes(
    location.pathname
  );

  return (
    <>
      {showHeader && <AppHeader perfil={perfil as any} />}
      <Routes>
        {/* Redirect raiz para login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Rotas públicas */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Rotas privadas */}
        {privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                perfisPermitidos={route.perfisPermitidos}
              >
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </>
  );
}



