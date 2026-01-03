/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
    },
    transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.spec.[jt]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/e2e/'
  ],
  moduleDirectories: ['node_modules', '<rootDir>']
};

module.exports = config;