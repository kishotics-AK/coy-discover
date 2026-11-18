
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    // Run the real API integration tests only.
    include: ["tests/discover.integration.test.ts"],

    globalSetup: ["tests/setup-test-db.ts"],

    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 15000,
  },
});
