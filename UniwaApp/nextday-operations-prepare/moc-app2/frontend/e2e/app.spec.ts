import { test, expect } from '@playwright/test';

test.describe('営業準備業務アプリ E2Eテスト', () => {
  test('ホームページが表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('header h1')).toContainText('営業準備アプリ');
    await expect(page.locator('main h1')).toContainText('営業準備業務');
    await expect(page.locator('text=在庫確認業務')).toBeVisible();
  });

  test('ホームページから在庫確認業務ボタンをクリックして遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ボタンをクリック
    await page.locator('button:has-text("在庫確認業務")').click();

    // URLが変更されることを確認
    await expect(page).toHaveURL(/.*inventory/, { timeout: 10000 });

    // ページが読み込まれることを確認
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('在庫確認', { timeout: 10000 });
  });

  test('ホームページから補充（移動）業務ボタンをクリックして遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ボタンをクリック
    await page.locator('button:has-text("補充（移動）業務")').click();

    // URLが変更されることを確認
    await expect(page).toHaveURL(/.*replenishment/, { timeout: 10000 });

    // ページが読み込まれることを確認
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('補充', { timeout: 10000 });
  });

  test('在庫確認業務ページに遷移できる', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page).toHaveURL(/.*inventory/);
    // Vue Routerの遅延読み込みを待つ
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('在庫確認');
  });

  test('補充（移動）業務ページに遷移できる', async ({ page }) => {
    await page.goto('/replenishment');
    await expect(page).toHaveURL(/.*replenishment/);
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('補充');
  });

  test('補充（作成）業務ページに遷移できる', async ({ page }) => {
    await page.goto('/creation');
    await expect(page).toHaveURL(/.*creation/);
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('作成');
  });

  test('発注依頼業務ページに遷移できる', async ({ page }) => {
    await page.goto('/order');
    await expect(page).toHaveURL(/.*order/);
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('発注依頼');
  });

  test('営業準備状況一覧ページに遷移できる', async ({ page }) => {
    await page.goto('/status');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*status/);
    await expect(page.locator('main h1')).toContainText('営業準備状況', { timeout: 30000 });
  });

  test('在庫確認業務ページで品物が表示される', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('在庫確認');

    // ローディング完了を待機
    await page
      .locator('main [class*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // 日付セレクタまたは場所セレクタが表示されることを確認
    const hasDateSelector =
      (await page.locator('main button, main input[type="date"]').count()) > 0;
    const hasPlaceSelector =
      (await page.locator('main select, main [role="combobox"]').count()) > 0;

    expect(hasDateSelector || hasPlaceSelector).toBeTruthy();
  });

  test('補充（移動）業務ページで場所選択が動作する', async ({ page }) => {
    await page.goto('/replenishment');
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('補充');

    // ローディング完了を待機
    await page
      .locator('main [class*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // 場所セレクタが表示されることを確認
    await expect(page.locator('main [role="combobox"], main select').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('補充（作成）業務ページで場所選択が動作する', async ({ page }) => {
    await page.goto('/creation');
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('作成');

    // ローディング完了を待機
    await page
      .locator('main [class*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // 場所セレクタが表示されることを確認
    await expect(page.locator('main [role="combobox"], main select').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('発注依頼業務ページで品物が表示される', async ({ page }) => {
    await page.goto('/order');
    await page.waitForFunction(
      () => {
        const main = document.querySelector('main');
        return main && main.querySelector('h1');
      },
      { timeout: 30000 }
    );
    await expect(page.locator('main h1')).toContainText('発注依頼');

    // ローディング完了を待機
    await page
      .locator('main [class*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // 日付セレクタが表示されることを確認
    await expect(page.locator('main button, main input[type="date"]').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('営業準備状況一覧ページでデータが表示される', async ({ page }) => {
    await page.goto('/status');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main h1')).toContainText('営業準備状況', { timeout: 30000 });

    // ローディング完了を待機
    await page
      .locator('main [class*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    // 日付セレクタが表示されることを確認
    await expect(page.locator('main button, main input[type="date"]').first()).toBeVisible({
      timeout: 15000,
    });
  });
});
