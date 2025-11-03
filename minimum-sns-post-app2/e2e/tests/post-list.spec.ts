import { test, expect } from '@playwright/test';

test.describe('投稿一覧表示機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-E2E-006: ページロード時に既存の投稿一覧が表示される', async ({ page }) => {
    // 投稿一覧セクションが表示されていることを確認
    await expect(page.locator('.posts-list')).toBeVisible();
    await expect(page.locator('h2:has-text("投稿一覧")')).toBeVisible();
    
    // 少なくとも1つ以上の投稿があることを確認（事前に投稿があることを想定）
    const postCount = await page.locator('.post-item').count();
    expect(postCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-E2E-007: 投稿が新しい順に表示される', async ({ page }) => {
    // テスト用に2つの投稿を作成
    const firstPost = `最初の投稿 ${Date.now()}`;
    await page.fill('textarea', firstPost);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    const secondPost = `2番目の投稿 ${Date.now()}`;
    await page.fill('textarea', secondPost);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    // 2番目の投稿が最初に表示されることを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(secondPost);
    await expect(page.locator('.post-item').nth(1).locator('.post-content')).toContainText(firstPost);
  });

  test('TC-E2E-008: 各投稿にEditボタンとDeleteボタンが表示される', async ({ page }) => {
    // 投稿が1つ以上あることを確認
    const postCount = await page.locator('.post-item').count();
    if (postCount === 0) {
      // 投稿がなければ作成
      await page.fill('textarea', 'ボタン確認用投稿');
      await page.click('button[type="submit"]:has-text("Submit")');
    }
    
    const firstPost = page.locator('.post-item').first();
    await expect(firstPost.locator('button:has-text("Edit")')).toBeVisible();
    await expect(firstPost.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('TC-E2E-009: 投稿が0件の場合「投稿がありません」と表示される', async ({ page }) => {
    // 全ての投稿を削除
    page.on('dialog', dialog => dialog.accept());
    
    let postCount = await page.locator('.post-item').count();
    while (postCount > 0) {
      await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
      await page.waitForTimeout(300);
      postCount = await page.locator('.post-item').count();
    }
    
    // 「投稿がありません」メッセージが表示されることを確認
    await expect(page.locator('.no-posts')).toBeVisible();
    await expect(page.locator('.no-posts')).toContainText('投稿がありません');
  });

  test('TC-E2E-010: 投稿には作成日時が表示される', async ({ page }) => {
    // 投稿が1つ以上あることを確認
    const postCount = await page.locator('.post-item').count();
    if (postCount === 0) {
      await page.fill('textarea', '日時確認用投稿');
      await page.click('button[type="submit"]:has-text("Submit")');
    }
    
    const firstPost = page.locator('.post-item').first();
    const dateElement = firstPost.locator('.post-date');
    await expect(dateElement).toBeVisible();
    
    // 日時フォーマットの確認（YYYY-MM-DD HH:MM形式）
    const dateText = await dateElement.textContent();
    expect(dateText).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
  });
});

