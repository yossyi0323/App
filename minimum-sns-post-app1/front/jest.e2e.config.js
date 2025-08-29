module.exports = {
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/tests/e2e/**/*.spec.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 30000, // E2Eテストは時間がかかるため
  verbose: true,
  collectCoverage: false, // E2Eテストではカバレッジを無効
  
  // Puppeteer の設定
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // モジュール解決
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
