import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/library": {
        target:
          "https://trabalhobd-20252-equipe-552419-production.up.railway.app",
        changeOrigin: true,
        secure: false,
        // Preserve the path as-is so the backend receives `/library/...`
        rewrite: (path) => path,
      },
    },
  },
});
