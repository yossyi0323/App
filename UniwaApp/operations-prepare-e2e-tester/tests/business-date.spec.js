// tests/business-date.spec.js

import { test, expect } from '@playwright/test';

// ターゲット日付
const TARGET_DATE = '2025年6月7日 (土曜日)';
const TARGET_MONTH_YEAR = '6月 2025';

test('業務日付を2025/06/07に変更できること', async ({ page }) => {
  // 1. 初期ページへの移動
  await page.goto('/');

  // 2. 日付セレクタを開く
  const datePickerButton = page.getByRole('button', { name: /^\d{4}年\d{1,2}月\d{1,2}日/ });
  await datePickerButton.click();
  
  // カレンダー内の年月表示要素が画面に表示されるまで待ち、ポップアップ表示を確実にする
  const currentMonthLocator = page.locator('[role="presentation"]', { hasText: /^\d{1,2}月 \d{4}$/ });
  await expect(currentMonthLocator).toBeVisible();

  // 3. ターゲットの「2025年6月」になるまでナビゲーション
  const prevMonthButton = page.getByRole('button', { name: 'Go to previous month' });

  let currentMonthText = await currentMonthLocator.textContent();
  let clickCount = 0;
  
  // ターゲットの月になるまで繰り返す (最大12回で終了)
  while (!currentMonthText.includes(TARGET_MONTH_YEAR) && clickCount < 12) {
    await prevMonthButton.click();
    
    // 月移動後のDOM更新を確実に待つ
    await page.waitForTimeout(500); 

    // 新しい年月テキストを再取得
    currentMonthText = await currentMonthLocator.textContent();
    clickCount++;
  }
  
  // ターゲットの月が表示されたことを検証（ナビゲーション成功の確認）
  await expect(currentMonthLocator).toHaveText(TARGET_MONTH_YEAR);

  // 4. ターゲットの日（7日）をクリック
  // アプリケーション側のバグ修正により、表示上の日付をクリックすれば良くなるため、
  // ロケーターを「day-outside」クラスを持たない「7」のボタンに修正します。
  const targetDayCell = page
    .locator('button[name="day"]')
    .filter({ hasNot: page.locator('.day-outside') }) // 他の月の日付を除外
    .filter({ hasText: /^7$/ }); // テキストコンテンツが「7」のものを選択
  
  // クリック操作を実行
  await targetDayCell.click();


  // 5. 業務日付が更新されたことを検証
  await expect(datePickerButton).toHaveText(TARGET_DATE);
});
