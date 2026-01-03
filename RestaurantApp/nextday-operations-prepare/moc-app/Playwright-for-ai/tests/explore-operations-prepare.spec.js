import { test, expect } from '@playwright/test';

test('operations-prepare アプリを探索', async ({ page }) => {
  console.log('=== operations-prepare アプリ探索開始 ===');
  
  // アプリにアクセス（Next.jsのデフォルトポート3000）
  console.log('アプリにアクセス: http://localhost:3000');
  await page.goto('http://localhost:3000');
  
  // 少し待つ（ページ読み込み完了待ち）
  await page.waitForTimeout(2000);
  
  // ページタイトルを取得
  const title = await page.title();
  console.log('ページタイトル:', title);
  
  // スクリーンショット撮影（全体）
  await page.screenshot({ 
    path: 'test-results/operations-prepare/01-home.png',
    fullPage: true 
  });
  console.log('スクリーンショット保存: 01-home.png');
  
  // ページの主要な要素を取得
  const bodyText = await page.locator('body').textContent();
  console.log('ページに表示されているテキスト（最初の500文字）:');
  console.log(bodyText.substring(0, 500));
  
  // ボタンやリンクを探す
  const buttons = await page.locator('button').count();
  const links = await page.locator('a').count();
  console.log(`ボタン数: ${buttons}`);
  console.log(`リンク数: ${links}`);
  
  // ナビゲーション要素を探す
  const nav = await page.locator('nav').count();
  if (nav > 0) {
    console.log('ナビゲーション要素が見つかりました');
    const navText = await page.locator('nav').first().textContent();
    console.log('ナビゲーション内容:', navText);
  }
  
  // カード要素を探す
  const cards = await page.locator('[class*="card"]').count();
  console.log(`カード要素数: ${cards}`);
  
  console.log('=== 探索完了 ===');
});

