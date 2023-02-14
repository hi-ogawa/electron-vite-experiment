import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import windicss from "vite-plugin-windicss";

export default defineConfig({
  base: "./",
  appType: "mpa",
  build: {
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: [path.resolve(__dirname, "src/renderer/index.html")],
    },
  },
  plugins: [windicss(), react()],
});
