module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/tests/security/**/*.test.ts'],
  // No globalSetup for middleware/unit tests
};
