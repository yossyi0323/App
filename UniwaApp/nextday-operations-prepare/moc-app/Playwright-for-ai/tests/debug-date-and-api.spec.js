// tests/debug-date-and-api.spec.js - 日付とAPIコールをデバッグ

import { test, expect } from '@playwright/test';

test('日付変更とAPIコールをデバッグ', async ({ page }) => {
  console.log('=== デバッグ開始 ===');
  
  // ネットワークリクエストを監視
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`API Request: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      console.log(`API Response: ${response.url()} - Status: ${status}`);
      
      if (status === 200) {
        try {
          const body = await response.json();
          if (Array.isArray(body)) {
            console.log(`  → データ件数: ${body.length}件`);
          }
        } catch (e) {
          // JSON以外のレスポンスは無視
        }
      }
    }
  });
  
  // 1. トップページにアクセス
  console.log('\n1. トップページにアクセス');
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // 2. storeの日付を確認（変更前）
  const initialDate = await page.evaluate(() => {
    const state = window.__PINIA_STATE__;
    return state?.businessDate?.businessDate || 'Unknown';
  });
  console.log(`  Store日付（変更前）: ${initialDate}`);
  
  // 3. 日付を変更
  console.log('\n2. 日付を2025-09-27に変更');
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2025-09-27');
  await dateInput.dispatchEvent('change');
  await page.waitForTimeout(1000);
  
  // 4. storeの日付を確認（変更後）
  const updatedDate = await page.evaluate(() => {
    const state = window.__PINIA_STATE__;
    return state?.businessDate?.businessDate || 'Unknown';
  });
  console.log(`  Store日付（変更後）: ${updatedDate}`);
  
  // 5. 営業準備状況一覧ページに遷移
  console.log('\n3. 営業準備状況一覧ページに遷移');
  await page.goto('/status');
  await page.waitForTimeout(2000);
  
  // 6. storeの日付を確認（ページ遷移後）
  const statusPageDate = await page.evaluate(() => {
    const state = window.__PINIA_STATE__;
    return state?.businessDate?.businessDate || 'Unknown';
  });
  console.log(`  Store日付（ページ遷移後）: ${statusPageDate}`);
  
  // 7. テーブルのデータ件数を確認
  await page.waitForTimeout(1000);
  const tableRows = await page.locator('tbody tr').count();
  console.log(`  テーブル行数: ${tableRows}行`);
  
  // 8. スクリーンショット
  await page.screenshot({ path: 'test-results/debug/status-page.png', fullPage: true });
  
  console.log('\n=== デバッグ完了 ===');
});

