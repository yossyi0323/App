import { test, expect } from '@playwright/test';

test.describe('Add Product Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have add product button', async ({ page }) => {
    const addBtn = page.locator('#addProductBtn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Product');
  });

  test('should add new product row when clicked', async ({ page }) => {
    // Initially 3 products
    let rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);

    // Click add button
    await page.locator('#addProductBtn').click();

    // Should have 4 products now
    rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(4);

    // Check new product has default values
    const newRow = rows.nth(3);
    await expect(newRow.locator('.name-input')).toHaveValue('新商品1');
    await expect(newRow.locator('.price-input')).toHaveValue('0');
    await expect(newRow.locator('.status')).toContainText('ready');
  });

  test('should add multiple products', async ({ page }) => {
    const addBtn = page.locator('#addProductBtn');

    // Add 3 products
    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    // Should have 6 products total
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);

    // Check names
    await expect(rows.nth(3).locator('.name-input')).toHaveValue('新商品1');
    await expect(rows.nth(4).locator('.name-input')).toHaveValue('新商品2');
    await expect(rows.nth(5).locator('.name-input')).toHaveValue('新商品3');
  });

  test('should auto-save new product when edited', async ({ page }) => {
    // Add new product
    await page.locator('#addProductBtn').click();

    const rows = page.locator('tbody tr');
    const newRow = rows.nth(3);
    const nameInput = newRow.locator('.name-input');
    const status = newRow.locator('.status');

    // Edit name
    await nameInput.fill('新しい野菜');

    // Should trigger auto-save
    await expect(status).toContainText('saving...', { timeout: 2000 });
    await expect(status).toContainText('saved', { timeout: 3000 });
  });

  test('should not affect other products when adding new one', async ({ page }) => {
    const tomatoStatus = page.locator('#status-product-1');
    const carrotStatus = page.locator('#status-product-2');

    // Check initial status
    await expect(tomatoStatus).toContainText('ready');
    await expect(carrotStatus).toContainText('ready');

    // Add new product
    await page.locator('#addProductBtn').click();

    // Wait a bit
    await page.waitForTimeout(500);

    // Existing products should still be ready
    await expect(tomatoStatus).toContainText('ready');
    await expect(carrotStatus).toContainText('ready');
  });

  test('should be able to delete newly added product', async ({ page }) => {
    // Add new product
    await page.locator('#addProductBtn').click();

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(4);

    const newRow = rows.nth(3);
    const deleteBtn = newRow.locator('.delete-btn');

    // Delete it
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('本当に削除しますか');
      dialog.accept();
    });

    await deleteBtn.click();

    page.once('dialog', dialog => {
      dialog.accept();
    });

    // Row should be disabled
    await page.waitForTimeout(1000);
    await expect(newRow).toHaveCSS('opacity', '0.5');
  });

  test('should log add product event to debug', async ({ page }) => {
    const debugEl = page.locator('#debug');

    // Add product
    await page.locator('#addProductBtn').click();

    // Wait for debug update
    await page.waitForTimeout(300);

    const debugText = await debugEl.textContent();
    expect(debugText).toContain('product added');
    expect(debugText).toContain('新商品1');
  });
});

