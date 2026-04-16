import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/comfy": {
        target: "http://127.0.0.1:8188",
        changeOrigin: true,
        secure: false,
        headers: {
          origin: "http://127.0.0.1:8188",
          referer: "http://127.0.0.1:8188/",
        },
        rewrite: (path) => path.replace(/^\/comfy/, ""),
      },
    },
  },
});