import { test, expect } from '@playwright/test';

test.describe('投稿削除機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-E2E-017: Deleteボタンをクリックすると確認ダイアログが表示される', async ({ page }) => {
    // テスト用投稿を作成
    await page.fill('textarea', `削除テスト用 ${Date.now()}`);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    // ダイアログイベントをリッスン
    let dialogShown = false;
    page.on('dialog', dialog => {
      dialogShown = true;
      dialog.dismiss();
    });
    
    await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
    
    // ダイアログが表示されたことを確認
    await page.waitForTimeout(100);
    expect(dialogShown).toBe(true);
  });

  test('TC-E2E-018: 確認ダイアログでOKをクリックすると投稿が削除される', async ({ page }) => {
    // テスト用投稿を作成
    const testContent = `削除されるべき投稿 ${Date.now()}`;
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    const initialPostCount = await page.locator('.post-item').count();
    
    // ダイアログを自動的に承認
    page.on('dialog', dialog => dialog.accept());
    
    await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
    await page.waitForTimeout(500);
    
    // 投稿が削除されたことを確認
    const currentPostCount = await page.locator('.post-item').count();
    expect(currentPostCount).toBe(initialPostCount - 1);
    
    // 削除された投稿が表示されないことを確認
    const posts = await page.locator('.post-content').allTextContents();
    expect(posts.some(content => content.includes(testContent))).toBe(false);
  });

  test('TC-E2E-019: 確認ダイアログでキャンセルをクリックすると削除されない', async ({ page }) => {
    // テスト用投稿を作成
    const testContent = `削除されない投稿 ${Date.now()}`;
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    const initialPostCount = await page.locator('.post-item').count();
    
    // ダイアログを自動的にキャンセル
    page.on('dialog', dialog => dialog.dismiss());
    
    await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
    await page.waitForTimeout(300);
    
    // 投稿が削除されていないことを確認
    const currentPostCount = await page.locator('.post-item').count();
    expect(currentPostCount).toBe(initialPostCount);
    
    // 投稿がまだ表示されることを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(testContent);
  });

  test('TC-E2E-020: 削除後、リストから該当の投稿が消える', async ({ page }) => {
    // テスト用投稿を2つ作成
    const firstContent = `1番目 ${Date.now()}`;
    await page.fill('textarea', firstContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    const secondContent = `2番目 ${Date.now()}`;
    await page.fill('textarea', secondContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    await page.waitForTimeout(500);
    
    // ダイアログを自動的に承認
    page.on('dialog', dialog => dialog.accept());
    
    // 最初の投稿（2番目の内容）を削除
    await page.locator('.post-item').first().locator('button:has-text("Delete")').click();
    await page.waitForTimeout(500);
    
    // 削除された投稿が表示されず、残りの投稿が表示されることを確認
    const posts = await page.locator('.post-content').allTextContents();
    expect(posts.some(content => content.includes(secondContent))).toBe(false);
    expect(posts.some(content => content.includes(firstContent))).toBe(true);
  });
});

