import { test, expect } from '@playwright/test';

test.describe('統合フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-E2E-021: 投稿作成→編集→削除の一連のフローが正常に動作する', async ({ page }) => {
    const originalContent = `統合テスト ${Date.now()}`;
    const updatedContent = `更新済み統合テスト ${Date.now()}`;
    
    // 1. 投稿作成
    await page.fill('textarea', originalContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    // 作成されたことを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(originalContent);
    
    // 2. 編集
    await page.locator('.post-item').first().locator('button:has-text("Edit")').click();
    await page.fill('textarea', updatedContent);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);
    
    // 更新されたことを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(updatedContent);
    
    // 3. 削除
    page.on('dialog', dialog => dialog.accept());
    const initialPostCount = await page.locator('.post-item').count();
    
    await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
    await page.waitForTimeout(500);
    
    // 削除されたことを確認
    const currentPostCount = await page.locator('.post-item').count();
    expect(currentPostCount).toBe(initialPostCount - 1);
    
    const posts = await page.locator('.post-content').allTextContents();
    expect(posts.some(content => content.includes(updatedContent))).toBe(false);
  });

  test('TC-E2E-022: 複数の投稿を作成→それぞれ編集→削除が正常に動作する', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    
    // 3つの投稿を作成
    const posts = [
      `投稿A ${Date.now()}`,
      `投稿B ${Date.now() + 1}`,
      `投稿C ${Date.now() + 2}`
    ];
    
    for (const content of posts) {
      await page.fill('textarea', content);
      await page.click('button[type="submit"]:has-text("Submit")');
      await page.waitForTimeout(500);
    }
    
    // 全ての投稿が表示されることを確認
    const postCount = await page.locator('.post-item').count();
    expect(postCount).toBeGreaterThanOrEqual(3);
    
    // それぞれの投稿を編集
    for (let i = 0; i < 3; i++) {
      const postIndex = i;
      const updatedContent = `更新済み投稿${String.fromCharCode(65 + i)} ${Date.now()}`;
      
      await page.locator('.post-item').nth(postIndex).locator('button:has-text("Edit")').click();
      await page.fill('textarea', updatedContent);
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(500);
      
      // 更新されたことを確認
      const allPosts = await page.locator('.post-content').allTextContents();
      expect(allPosts.some(content => content.includes(updatedContent))).toBe(true);
    }
    
    // 上から3つの投稿を削除
    for (let i = 0; i < 3; i++) {
      await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
      await page.waitForTimeout(500);
    }
    
    // 削除された投稿が表示されないことを確認
    const finalPosts = await page.locator('.post-content').allTextContents();
    for (const content of posts) {
      expect(finalPosts.some(p => p.includes(content))).toBe(false);
    }
  });
});

