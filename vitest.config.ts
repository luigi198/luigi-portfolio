import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "node",
    // Fixed fake values: tests never inherit the ambient shell's env.
    env: {
      NEXT_PUBLIC_SITE_URL: "https://example.test",
    },
  },
});
