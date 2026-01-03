import { test, expect } from '@playwright/test';

test.setTimeout(120000); // 2分に延長

test('operations-prepare 全画面キャプチャ（6月7日）', async ({ page }) => {
  console.log('=== operations-prepare 全画面キャプチャ開始（スマホ版） ===');
  
  // スマホのビューポートに設定（iPhone 14 Pro）
  await page.setViewportSize({ width: 393, height: 852 });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // === 日付を6月7日に変更 ===
  console.log('日付を6月7日に変更中...');
  
  // 日付セレクタを開く
  const datePickerButton = page.getByRole('button', { name: /^\d{4}年\d{1,2}月\d{1,2}日/ });
  await datePickerButton.click();
  
  // カレンダーが表示されるまで待つ
  const currentMonthLocator = page.locator('[role="presentation"]', { hasText: /^\d{1,2}月 \d{4}$/ });
  await expect(currentMonthLocator).toBeVisible();
  
  // 6月2025になるまで「前月」ボタンをクリック
  const prevMonthButton = page.getByRole('button', { name: 'Go to previous month' });
  let currentMonthText = await currentMonthLocator.textContent();
  let clickCount = 0;
  
  while (!currentMonthText.includes('6月 2025') && clickCount < 12) {
    await prevMonthButton.click();
    await page.waitForTimeout(500);
    currentMonthText = await currentMonthLocator.textContent();
    clickCount++;
  }
  
  // 7日をクリック
  const targetDayCell = page
    .locator('button[name="day"]')
    .filter({ hasNot: page.locator('.day-outside') })
    .filter({ hasText: /^7$/ });
  await targetDayCell.click();
  
  console.log('日付を6月7日に変更完了');
  await page.waitForTimeout(1000);
  
  // === 各画面のスクリーンショット撮影 ===
  
  // 1. トップページ
  console.log('1. トップページ（6月7日）');
  await page.screenshot({ 
    path: 'test-results/operations-prepare/01-top-0607.png',
    fullPage: true 
  });
  
  // 2. 在庫確認
  console.log('2. 在庫確認（6月7日）');
  await page.locator('text=在庫確認').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ 
    path: 'test-results/operations-prepare/02-inventory-0607.png',
    fullPage: true 
  });
  
  // 3. 補充
  console.log('3. 補充（6月7日）');
  await page.locator('text=補充').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ 
    path: 'test-results/operations-prepare/03-replenishment-0607.png',
    fullPage: true 
  });
  
  // 4. 作成
  console.log('4. 作成（6月7日）');
  await page.locator('text=作成').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ 
    path: 'test-results/operations-prepare/04-creation-0607.png',
    fullPage: true 
  });
  
  // 5. 発注依頼
  console.log('5. 発注依頼（6月7日）');
  const orderLink = page.locator('text=発注依頼').first();
  if (await orderLink.count() > 0) {
    await orderLink.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: 'test-results/operations-prepare/05-order-0607.png',
      fullPage: true 
    });
  }
  
  // 6. 状況一覧
  console.log('6. 状況一覧（6月7日）');
  const statusLink = page.locator('text=状況一覧').first();
  if (await statusLink.count() > 0) {
    await statusLink.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: 'test-results/operations-prepare/06-status-0607.png',
      fullPage: true 
    });
  }
  
  console.log('=== 全画面キャプチャ完了 ===');
});
