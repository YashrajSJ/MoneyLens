export default {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup/loadTestEnv.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupTests.js"],
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  testTimeout: 30000,
};