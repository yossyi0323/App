// tests/explore-with-navigation.spec.js - ナビゲーションボタンを使って探索

import { test, expect } from '@playwright/test';

test('日付を変更してナビゲーションボタンで各画面を探索', async ({ page }) => {
  console.log('=== ナビゲーション探索開始 ===');
  
  // APIコールを監視
  page.on('response', async response => {
    if (response.url().includes('/api/inventory-status')) {
      const status = response.status();
      if (status === 200) {
        try {
          const body = await response.json();
          if (Array.isArray(body)) {
            console.log(`  API Response: ${body.length}件のデータ`);
          }
        } catch (e) {}
      }
    }
  });
  
  // 1. トップページにアクセス
  console.log('\n1. トップページにアクセス');
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // 2. 日付を変更
  console.log('\n2. 業務日付を2025-09-27に変更');
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2025-09-27');
  await dateInput.dispatchEvent('change');
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'test-results/navigation/01-home.png', fullPage: true });
  
  // 3. 在庫確認業務カードをクリック
  console.log('\n3. 在庫確認業務に遷移（カードクリック）');
  await page.getByText('在庫確認業務').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/navigation/02-inventory.png', fullPage: true });
  
  // 4. サイドバーから補充（移動）業務に遷移
  console.log('\n4. 補充（移動）業務に遷移（サイドバー）');
  await page.getByText('補充（移動）業務').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/navigation/03-replenishment.png', fullPage: true });
  
  // 5. サイドバーから補充（作成）業務に遷移
  console.log('\n5. 補充（作成）業務に遷移（サイドバー）');
  await page.getByText('補充（作成）業務').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/navigation/04-creation.png', fullPage: true });
  
  // 6. サイドバーから発注依頼業務に遷移
  console.log('\n6. 発注依頼業務に遷移（サイドバー）');
  await page.getByText('発注依頼業務').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/navigation/05-order.png', fullPage: true });
  
  // 7. サイドバーから営業準備状況一覧に遷移
  console.log('\n7. 営業準備状況一覧に遷移（サイドバー）');
  await page.getByText('営業準備状況一覧').click();
  await page.waitForTimeout(2000);
  
  // テーブルの行数を確認
  const tableRows = await page.locator('tbody tr').count();
  console.log(`  → テーブル行数: ${tableRows}行`);
  
  await page.screenshot({ path: 'test-results/navigation/06-status.png', fullPage: true });
  
  console.log('\n=== 探索完了 ===');
});

