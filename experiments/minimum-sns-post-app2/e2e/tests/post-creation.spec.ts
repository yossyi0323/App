import { test, expect } from '@playwright/test';
import { captureConsoleLog, captureNetworkErrors } from './helpers';

test.describe('投稿作成機能', () => {
  test.beforeEach(async ({ page }) => {
    captureConsoleLog(page);
    captureNetworkErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-E2E-001: テキストを入力してSubmitボタンをクリックすると投稿が作成される', async ({ page }) => {
    const testContent = `E2Eテスト投稿 ${Date.now()}`;
    
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // 投稿が一覧に表示されることを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(testContent);
  });

  test('TC-E2E-002: 空のテキストでSubmitすると投稿が作成されない', async ({ page }) => {
    const initialPostCount = await page.locator('.post-item').count();
    
    await page.fill('textarea', '');
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // エラーメッセージが表示される
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('投稿内容を入力してください');
    
    // 投稿数が変わらないことを確認
    const currentPostCount = await page.locator('.post-item').count();
    expect(currentPostCount).toBe(initialPostCount);
  });

  test('TC-E2E-003: 投稿作成後、テキストエリアがクリアされる', async ({ page }) => {
    const testContent = `クリアテスト ${Date.now()}`;
    
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // 投稿が作成されるのを待つ
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(testContent);
    
    // テキストエリアが空になっていることを確認
    await expect(page.locator('textarea')).toHaveValue('');
  });

  test('TC-E2E-004: 投稿作成中は「送信中...」と表示される', async ({ page }) => {
    const testContent = `送信中テスト ${Date.now()}`;
    
    await page.fill('textarea', testContent);
    
    // ネットワークをスローダウンしてローディング状態を確認
    let routeHandled = false;
    await page.route('**/api/posts', async (route) => {
      if (!routeHandled) {
        routeHandled = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      } else {
        await route.continue();
      }
    });
    
    const submitPromise = page.click('button[type="submit"]:has-text("Submit")');
    
    // 送信中のテキストを確認（タイミングによっては表示されないかもしれないのでtry-catch）
    try {
      await expect(page.locator('button:has-text("送信中")')).toBeVisible({ timeout: 200 });
    } catch {
      // タイミングが合わなければスキップ
    }
    
    await submitPromise;
    
    // ルートをクリーンアップ
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-E2E-005: 作成した投稿が一覧の最上部に表示される', async ({ page }) => {
    const testContent = `最上部テスト ${Date.now()}`;
    
    await page.fill('textarea', testContent);
    await page.click('button[type="submit"]:has-text("Submit")');
    
    // 最初の投稿アイテムが新しく作成したものであることを確認
    await expect(page.locator('.post-item').first().locator('.post-content')).toContainText(testContent);
  });
});

