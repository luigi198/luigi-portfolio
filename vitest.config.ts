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
      // The twin's server settings: fake, so no test can reach a real account or store.
      ANTHROPIC_API_KEY: "test-anthropic-key",
      UPSTASH_REDIS_REST_URL: "https://redis.example.test",
      UPSTASH_REDIS_REST_TOKEN: "test-redis-token",
      KV_REST_API_URL: "",
      KV_REST_API_TOKEN: "",
      VISITOR_HASH_SALT: "test-salt",
      TWIN_DAILY_BUDGET_USD: "5",
    },
  },
});
