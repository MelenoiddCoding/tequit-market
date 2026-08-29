import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  test: { environment: "node", include: ["tests/**/*.test.ts"], env: { NEXT_PUBLIC_DEMO_MODE: "true" } },
});
