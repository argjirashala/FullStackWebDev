import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3003",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test_Setup.js",
  },
});
