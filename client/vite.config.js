import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";

export default defineConfig(({ mode }) => {
  const envFile = path.resolve(__dirname, `config/.env.${mode}`);
  dotenv.config({ path: envFile });

  return {
    plugins: [react()],
    server: mode === "development" ? {
      proxy: {
        "/api": {
          target: process.env.VITE_SERVER_URL,
          changeOrigin: true,
          ws: true,
          secure: false,
        },
      },
    } : {},
    build: {
      outDir: '../server/public/build',
      emptyOutDir: true,
    },
  };
});