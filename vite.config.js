import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");
// https://vitejs.dev/config/
export default defineConfig({
  base: "/app/",
  cacheDir: "/tmp/swsdf-sa-vite-cache",
  server: {
    port: 8080,
    host: "0.0.0.0",
    hmr: {
      clientPort: 8911,
    },
    // hot: true,
    // watch: {
    //   usePolling: true,
    // },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    assetsDir: "new-front/assets",
  },
  optimizeDeps: {
    include: ["primevue/useconfirm", "primevue/message", "primevue/confirmdialog"],
  },
  chokidarWatchOptions: {
    usePolling: true,
  },

  plugins: [vue()],
  define: {
    __VUE_OPTIONS_API__: JSON.stringify(true), // Set to true or false based on your use case
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // Set to true if you need devtools in production
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true), // Enable detailed hydration mismatch warnings
  },
  resolve: {
    alias: {
      // "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
    },
  },
});
