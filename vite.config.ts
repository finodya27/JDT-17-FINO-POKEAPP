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
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function, not an object
        manualChunks: (id: string) => {
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion-dom") || id.includes("node_modules/motion-utils")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-query";
          }
          if (id.includes("node_modules/zustand")) {
            return "vendor-zustand";
          }
          if (id.includes("node_modules/react-router-dom") || id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/react-dom")) {
            return "vendor-react-dom";
          }
          if (id.includes("node_modules/react/")) {
            return "vendor-react";
          }
        },
      },
    },
  },
});
