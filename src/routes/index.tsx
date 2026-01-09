import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { privateRoutes } from "@/routes/privateRoutes";
import { publicRoutes } from "@/routes/publicRoutes";

export function AppRoutes() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
