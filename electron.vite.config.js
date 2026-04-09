import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "dist-electron/main",
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, "electron/main.js"),
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "dist-electron/preload",
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, "electron/preload.js"),
      },
    },
  },

  renderer: {
    root: __dirname,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
      },
    },
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
    },
    clearScreen: false,
  },
});