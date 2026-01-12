import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/store/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/theme-provider";

// Mock adapter desabilitado - consumindo API real
// if (import.meta.env.DEV) {
//   await import("./services/mockAdapter");
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <ErrorBoundary>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
