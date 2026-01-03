// tests/navigation-to-replenishment.spec.js

import { test, expect } from '@playwright/test';

test('トップページから補充ページに移動できること', async ({ page }) => {
  // 1. トップページに移動
  await page.goto('/');

  // 2. 「補充（移動）」ボタンをクリック
  // ボタンのテキストとアイコンの組み合わせで特定
  const replenishmentButton = page.getByRole('button').filter({ 
    hasText: '補充（移動）' 
  });
  
  // ボタンが表示されていることを確認
  await expect(replenishmentButton).toBeVisible();
  
  // ボタンをクリック
  await replenishmentButton.click();

  // 3. 補充ページに移動したことを確認
  // URLが変更されたことを確認
  await expect(page).toHaveURL(/.*\/replenishment/);
  
  // 補充ページの特徴的な要素が表示されることを確認
  // より具体的なセレクターを使用して「補充」のh1要素を確認
  await expect(page.locator('h1.text-xl.font-bold')).toHaveText('補充');
});
