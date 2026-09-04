module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
};
