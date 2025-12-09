/**
 * End-to-End テスト
 * 実際のブラウザでアプリケーション全体の動作をテスト
 * 
 * 注意: このテストを実行するには以下が必要です:
 * 1. バックエンドサーバーが localhost:8080 で起動していること
 * 2. フロントエンドサーバーが localhost:3000 で起動していること
 * 3. Cypress または Playwright などのE2Eテストツールのセットアップ
 */

// Jest + Puppeteer を使用したシンプルなE2Eテスト例
// 実際の運用では Cypress や Playwright を推奨

const puppeteer = require('puppeteer')

describe('Minimum SNS Post App1 E2E Tests', () => {
  let browser
  let page
  const APP_URL = 'http://localhost:3000'
  const API_URL = 'http://localhost:8080'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.CI === 'true', // CI環境ではヘッドレス
      slowMo: 50 // デバッグ用にスローダウン
    })
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
  })

  beforeEach(async () => {
    page = await browser.newPage()
    
    // API サーバーのヘルスチェック
    try {
      const response = await fetch(`${API_URL}/api/posts/health`)
      if (!response.ok) {
        throw new Error('API server is not running')
      }
    } catch (error) {
      console.warn('API server health check failed:', error.message)
      console.warn('Make sure the backend server is running on localhost:8080')
    }
  })

  afterEach(async () => {
    if (page) {
      await page.close()
    }
  })

  describe('アプリケーション基本機能', () => {
    test('ページが正常に読み込まれる', async () => {
      await page.goto(APP_URL)
      
      // タイトルが正しく表示される
      await page.waitForSelector('h1')
      const title = await page.$eval('h1', el => el.textContent)
      expect(title).toBe('Minimum SNS Post App1')
      
      // 投稿フォームが表示される
      await page.waitForSelector('textarea')
      await page.waitForSelector('button[type="submit"]')
      
      // 投稿一覧セクションが表示される
      await page.waitForSelector('.posts-list')
    })

    test('投稿フォームの基本動作', async () => {
      await page.goto(APP_URL)
      
      // テキストエリアに入力
      const textarea = await page.waitForSelector('textarea')
      await textarea.type('E2Eテスト投稿')
      
      // 文字数カウンターが更新される
      const charCount = await page.waitForSelector('.char-count')
      const countText = await charCount.evaluate(el => el.textContent)
      expect(countText).toBe('8/1000文字')
      
      // 送信ボタンが有効になる
      const submitButton = await page.waitForSelector('button[type="submit"]')
      const isDisabled = await submitButton.evaluate(el => el.disabled)
      expect(isDisabled).toBe(false)
    })
  })

  describe('投稿機能のフルフロー', () => {
    test('投稿の作成から表示までが正常に動作する', async () => {
      await page.goto(APP_URL)
      
      // 1. 投稿内容を入力
      const testContent = `E2Eテスト投稿 ${Date.now()}`
      await page.type('textarea', testContent)
      
      // 2. 投稿ボタンをクリック
      await page.click('button[type="submit"]')
      
      // 3. 成功メッセージが表示される
      await page.waitForSelector('.success')
      const successMessage = await page.$eval('.success', el => el.textContent)
      expect(successMessage).toBe('投稿が完了しました！')
      
      // 4. フォームがクリアされる
      const textareaValue = await page.$eval('textarea', el => el.value)
      expect(textareaValue).toBe('')
      
      // 5. 投稿一覧に新しい投稿が表示される
      await page.waitForSelector('.post-item')
      const postContent = await page.$eval('.post-item .post-content', el => el.textContent)
      expect(postContent).toBe(testContent)
      
      // 6. 投稿件数が更新される
      const postsHeader = await page.waitForSelector('.posts-header p')
      const headerText = await postsHeader.evaluate(el => el.textContent)
      expect(headerText).toContain('件の投稿')
    })

    test('複数の投稿が正しい順序で表示される', async () => {
      await page.goto(APP_URL)
      
      // 1番目の投稿
      await page.type('textarea', '1番目の投稿')
      await page.click('button[type="submit"]')
      await page.waitForSelector('.success')
      
      // 少し待機（作成時刻の差を作るため）
      await page.waitForTimeout(1000)
      
      // 2番目の投稿
      await page.type('textarea', '2番目の投稿')
      await page.click('button[type="submit"]')
      await page.waitForSelector('.success')
      
      // 投稿が新しい順で表示されることを確認
      const postItems = await page.$$('.post-item .post-content')
      expect(postItems).toHaveLength(2)
      
      const firstPostContent = await postItems[0].evaluate(el => el.textContent)
      const secondPostContent = await postItems[1].evaluate(el => el.textContent)
      
      expect(firstPostContent).toBe('2番目の投稿') // 新しい投稿が最初
      expect(secondPostContent).toBe('1番目の投稿')
    })
  })

  describe('バリデーション機能', () => {
    test('空の投稿では送信ボタンが無効化される', async () => {
      await page.goto(APP_URL)
      
      // 初期状態で送信ボタンが無効
      const submitButton = await page.waitForSelector('button[type="submit"]')
      let isDisabled = await submitButton.evaluate(el => el.disabled)
      expect(isDisabled).toBe(true)
      
      // 空白文字のみ入力
      await page.type('textarea', '   ')
      isDisabled = await submitButton.evaluate(el => el.disabled)
      expect(isDisabled).toBe(true)
      
      // 有効な文字を入力
      await page.type('textarea', 'テスト')
      isDisabled = await submitButton.evaluate(el => el.disabled)
      expect(isDisabled).toBe(false)
    })

    test('文字数制限が正しく動作する', async () => {
      await page.goto(APP_URL)
      
      // 1000文字まで入力可能
      const longText = 'a'.repeat(1000)
      await page.type('textarea', longText)
      
      const charCount = await page.$eval('.char-count', el => el.textContent)
      expect(charCount).toBe('1000/1000文字')
      
      // 送信ボタンは有効
      const submitButton = await page.waitForSelector('button[type="submit"]')
      const isDisabled = await submitButton.evaluate(el => el.disabled)
      expect(isDisabled).toBe(false)
    })
  })

  describe('エラーハンドリング', () => {
    test('APIサーバーが停止している場合のエラー処理', async () => {
      // このテストは手動でAPIサーバーを停止した場合の動作を確認
      // 実際のテストでは、モックサーバーやネットワークインターセプトを使用することを推奨
      
      await page.goto(APP_URL)
      
      // ネットワークをオフラインに設定
      await page.setOfflineMode(true)
      
      await page.type('textarea', 'オフラインテスト')
      await page.click('button[type="submit"]')
      
      // エラーメッセージが表示される
      await page.waitForSelector('.error')
      const errorMessage = await page.$eval('.error', el => el.textContent)
      expect(errorMessage).toContain('失敗')
      
      // オンラインに戻す
      await page.setOfflineMode(false)
    })
  })

  describe('レスポンシブデザイン', () => {
    test('モバイルサイズでも正しく表示される', async () => {
      await page.goto(APP_URL)
      
      // モバイルサイズに変更
      await page.setViewport({ width: 375, height: 667 })
      
      // 要素が正しく表示される
      await page.waitForSelector('h1')
      await page.waitForSelector('textarea')
      await page.waitForSelector('button[type="submit"]')
      
      // フォームが使用可能
      await page.type('textarea', 'モバイルテスト')
      await page.click('button[type="submit"]')
      
      await page.waitForSelector('.success')
      await page.waitForSelector('.post-item')
    })

    test('タブレットサイズでも正しく表示される', async () => {
      await page.goto(APP_URL)
      
      // タブレットサイズに変更
      await page.setViewport({ width: 768, height: 1024 })
      
      // レイアウトが正しく調整される
      await page.waitForSelector('h1')
      await page.waitForSelector('.container')
      
      // 機能が正常に動作する
      await page.type('textarea', 'タブレットテスト')
      await page.click('button[type="submit"]')
      
      await page.waitForSelector('.success')
    })
  })

  describe('アクセシビリティ', () => {
    test('キーボード操作が可能', async () => {
      await page.goto(APP_URL)
      
      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab') // textareaにフォーカス
      await page.keyboard.type('キーボードテスト')
      
      await page.keyboard.press('Tab') // 送信ボタンにフォーカス
      await page.keyboard.press('Enter') // 送信
      
      await page.waitForSelector('.success')
      await page.waitForSelector('.post-item')
    })

    test('適切なARIAラベルが設定されている', async () => {
      await page.goto(APP_URL)
      
      // フォーム要素のラベルが正しく関連付けられている
      const textarea = await page.waitForSelector('textarea')
      const textareaId = await textarea.evaluate(el => el.id)
      
      const label = await page.waitForSelector('label')
      const labelFor = await label.evaluate(el => el.getAttribute('for'))
      
      expect(textareaId).toBe(labelFor)
    })
  })
})
