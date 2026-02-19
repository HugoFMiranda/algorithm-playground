import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(workspaceRoot, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
