import { test, expect } from '@playwright/test';

test.describe('在庫確認画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('基本フロー', async ({ page }) => {
    // 初期表示の確認
    await expect(page.getByRole('heading', { name: '在庫確認' })).toBeVisible();
    await expect(page.getByLabel('業務日付')).toBeVisible();
    await expect(page.getByLabel('確認する場所')).toBeVisible();

    // 日付選択
    await page.getByLabel('業務日付').fill('2024-03-20');
    await page.getByLabel('業務日付').press('Enter');

    // 場所選択
    await page.getByLabel('確認する場所').click();
    await page.getByText('テスト場所1').click();

    // 品目一覧の表示確認
    await expect(page.getByText('テスト品目1')).toBeVisible();

    // 在庫数入力
    await page.getByLabel('在庫数').fill('10');
    await page.getByLabel('在庫数').press('Enter');

    // 補充数入力
    await page.getByLabel('補充数').fill('5');
    await page.getByLabel('補充数').press('Enter');

    // 補充ステータス切り替え
    await page.getByRole('switch').click();

    // メモ入力
    await page.getByLabel('メモ欄を開く').click();
    await page.getByLabel('メモ').fill('テストメモ');
    await page.getByLabel('メモ').press('Enter');

    // ステータスバッジの確認
    await expect(page.getByText('確認済')).toBeVisible();
    await expect(page.getByText('要補充')).toBeVisible();
  });

  test('一括操作', async ({ page }) => {
    // 場所選択
    await page.getByLabel('確認する場所').click();
    await page.getByText('テスト場所1').click();

    // 一括確認
    await page.getByText('一括確認').click();
    await expect(page.getByText('確認済')).toBeVisible();

    // 一括補充
    await page.getByText('一括補充').click();
    await expect(page.getByText('要補充')).toBeVisible();
  });

  test('エラー表示', async ({ page }) => {
    // 日付未選択
    await page.getByLabel('確認する場所').click();
    await page.getByText('テスト場所1').click();
    await expect(page.getByText('業務日付を選択してください')).toBeVisible();

    // 場所未選択
    await page.getByLabel('業務日付').fill('2024-03-20');
    await page.getByLabel('業務日付').press('Enter');
    await expect(page.getByText('確認する場所を選択してください')).toBeVisible();
  });

  test('パフォーマンス', async ({ page }) => {
    // 大量データ時の表示速度
    const startTime = Date.now();
    await page.getByLabel('確認する場所').click();
    await page.getByText('テスト場所1').click();
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000); // 1秒以内に表示されることを確認

    // 自動保存の動作確認
    await page.getByLabel('在庫数').fill('10');
    await page.getByLabel('在庫数').press('Enter');
    await expect(page.getByText('保存しました')).toBeVisible();
  });
});
