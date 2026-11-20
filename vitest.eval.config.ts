import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Paid eval runs only. Unlike vitest.config.ts, this config sets no fake env:
// the run deliberately uses the real ANTHROPIC_API_KEY from .env.local.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["evals/**/*.eval.ts"],
    environment: "node",
    testTimeout: 15 * 60 * 1000,
  },
});
