/**
 * E2E テストのセットアップファイル
 */

// タイムアウトの延長
jest.setTimeout(30000)

// Puppeteer のグローバル設定
global.puppeteerConfig = {
  launch: {
    headless: process.env.CI === 'true',
    slowMo: process.env.NODE_ENV === 'development' ? 50 : 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
}

// テスト前の共通処理
beforeAll(async () => {
  console.log('🚀 E2E テストを開始します')
  console.log('📍 フロントエンド: http://localhost:3000')
  console.log('📍 バックエンド: http://localhost:8080')
})

afterAll(async () => {
  console.log('✅ E2E テストが完了しました')
})

// 未処理の Promise rejection を捕捉
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
