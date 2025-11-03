import { test, expect } from '@playwright/test';

test.describe('投稿編集機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // テスト用投稿を作成
    const testContent = `編集テスト用投稿 ${Date.now()}`;
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
  });

  test('TC-E2E-011: Editボタンをクリックするとテキストエリアに内容が読み込まれる', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    const originalContent = await firstPost.locator('.post-content').textContent();
    
    await firstPost.locator('button:has-text("Edit")').click();
    
    // テキストエリアに内容が読み込まれることを確認
    const textareaValue = await page.locator('textarea').inputValue();
    expect(textareaValue).toBe(originalContent);
  });

  test('TC-E2E-012: 編集モード中、ボタンが「Save」に変更される', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    await firstPost.locator('button:has-text("Edit")').click();
    
    // Submitボタンが「Save」に変更されることを確認
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).not.toBeVisible();
  });

  test('TC-E2E-013: 編集モード中、Cancelボタンが表示される', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    await firstPost.locator('button:has-text("Edit")').click();
    
    // Cancelボタンが表示されることを確認
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

  test('TC-E2E-014: Saveボタンをクリックすると投稿が更新される', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    await firstPost.locator('button:has-text("Edit")').click();
    
    const updatedContent = `更新済み ${Date.now()}`;
    await page.fill('textarea', updatedContent);
    await page.click('button:has-text("Save")');
    
    // 更新が反映されることを確認
    await page.waitForTimeout(500);
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(updatedContent);
  });

  test('TC-E2E-015: Cancelボタンをクリックすると編集がキャンセルされる', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    const originalContent = await firstPost.locator('.post-content').textContent();
    
    await firstPost.locator('button:has-text("Edit")').click();
    await page.fill('textarea', '変更はキャンセルされる');
    await page.click('button:has-text("Cancel")');
    
    // 元の内容が維持されることを確認
    await expect(firstPost.locator('.post-content')).toContainText(originalContent || '');
    
    // テキストエリアが空になることを確認
    await expect(page.locator('textarea')).toHaveValue('');
    
    // Submitボタンに戻ることを確認
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });

  test('TC-E2E-016: 更新後、リストに変更内容が反映される', async ({ page }) => {
    const firstPost = page.locator('.post-item').first();
    await firstPost.locator('button:has-text("Edit")').click();
    
    const updatedContent = `反映確認 ${Date.now()}`;
    await page.fill('textarea', updatedContent);
    await page.click('button:has-text("Save")');
    
    // 更新が即座にリストに反映されることを確認
    await page.waitForTimeout(500);
    const postCount = await page.locator('.post-item').count();
    
    // 最初の投稿に更新内容が表示されることを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(updatedContent);
  });
});

