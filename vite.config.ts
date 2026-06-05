import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const port = parseInt(process.env.PORT || "5173", 10);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
