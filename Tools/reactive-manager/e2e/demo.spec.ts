import { test, expect } from '@playwright/test';

test.describe('ReactiveManager Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('@tools/reactive-manager Demo');
    await expect(page.locator('.subtitle')).toContainText('各商品は独立して自動保存されます');
  });

  test('should display three product rows', async ({ page }) => {
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    
    // Check product names in input fields
    await expect(rows.nth(0).locator('.name-input')).toHaveValue('トマト');
    await expect(rows.nth(1).locator('.name-input')).toHaveValue('にんじん');
    await expect(rows.nth(2).locator('.name-input')).toHaveValue('じゃがいも');
  });

  test('should display initial product data', async ({ page }) => {
    // Check tomato initial values
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    await expect(tomatoPriceInput).toHaveValue('150');
    
    const tomatoDescInput = page.locator('.description-input[data-product-id="product-1"]');
    await expect(tomatoDescInput).toContainText('新鮮な完熟トマト');
  });

  test('should show initial ready status for all products', async ({ page }) => {
    const statuses = page.locator('.status');
    await expect(statuses).toHaveCount(3);
    
    for (let i = 0; i < 3; i++) {
      await expect(statuses.nth(i)).toContainText('ready');
    }
  });

  test('should update price and trigger auto-save', async ({ page }) => {
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    const tomatoStatus = page.locator('#status-product-1');
    
    // Change price
    await tomatoPriceInput.fill('200');
    
    // Should show saving state after a moment
    await page.waitForTimeout(100);
    await expect(tomatoStatus).toContainText('saving...', { timeout: 2000 });
    
    // Should show saved state after debounce + save time
    await expect(tomatoStatus).toContainText('saved', { timeout: 3000 });
  });

  test('should save products independently', async ({ page }) => {
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    const carrotPriceInput = page.locator('.price-input[data-product-id="product-2"]');
    const tomatoStatus = page.locator('#status-product-1');
    const carrotStatus = page.locator('#status-product-2');
    
    // Change tomato price
    await tomatoPriceInput.fill('200');
    
    // Tomato should start saving
    await expect(tomatoStatus).toContainText('saving...', { timeout: 2000 });
    
    // Carrot should still be ready
    await expect(carrotStatus).toContainText('ready');
    
    // Wait for tomato to finish saving
    await expect(tomatoStatus).toContainText('saved', { timeout: 3000 });
    
    // Carrot should still be ready (not affected by tomato)
    await expect(carrotStatus).toContainText('ready');
  });

  test('should force save immediately', async ({ page }) => {
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    const tomatoStatus = page.locator('#status-product-1');
    const forceSaveBtn = page.locator('.force-save-btn[data-product-id="product-1"]');
    
    // Change price
    await tomatoPriceInput.fill('250');
    
    // Click force save before debounce completes
    await forceSaveBtn.click();
    
    // Should show saving immediately
    await expect(tomatoStatus).toContainText('saving...', { timeout: 500 });
    
    // Should show saved
    await expect(tomatoStatus).toContainText('saved', { timeout: 2000 });
  });

  test('should update description and trigger auto-save', async ({ page }) => {
    const tomatoDescInput = page.locator('.description-input[data-product-id="product-1"]');
    const tomatoStatus = page.locator('#status-product-1');
    
    // Change description
    await tomatoDescInput.fill('とても新鮮なトマトです');
    
    // Should trigger auto-save
    await expect(tomatoStatus).toContainText('saving...', { timeout: 2000 });
    await expect(tomatoStatus).toContainText('saved', { timeout: 3000 });
  });

  test('should execute custom check operation', async ({ page }) => {
    const checkBtn = page.locator('.check-btn[data-product-id="product-1"]');
    
    // Click check button
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('トマトの在庫チェック結果');
      dialog.accept();
    });
    
    await checkBtn.click();
  });

  test('should execute delete operation', async ({ page }) => {
    const deleteBtn = page.locator('.delete-btn[data-product-id="product-1"]');
    const tomatoRow = page.locator('#product-product-1');
    
    // Click delete button
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('トマトを本当に削除しますか？');
      dialog.accept();
    });
    
    await deleteBtn.click();
    
    // Wait for second dialog (confirmation)
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('トマトを削除しました');
      dialog.accept();
    });
    
    // Row should be disabled
    await page.waitForTimeout(1000);
    await expect(tomatoRow).toHaveCSS('opacity', '0.5');
  });

  test('should display debug information', async ({ page }) => {
    const debugEl = page.locator('#debug');
    
    // Debug info should exist
    await expect(debugEl).toBeVisible();
    
    // Should contain initialization info
    const debugText = await debugEl.textContent();
    expect(debugText).toContain('initialized');
    expect(debugText).toContain('トマト');
    expect(debugText).toContain('にんじん');
    expect(debugText).toContain('じゃがいも');
  });

  test('should log events to debug when interacting', async ({ page }) => {
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    const debugEl = page.locator('#debug');
    
    // Change price
    await tomatoPriceInput.fill('300');
    
    // Wait for event to be logged
    await page.waitForTimeout(500);
    
    const debugText = await debugEl.textContent();
    expect(debugText).toContain('input changed');
    expect(debugText).toContain('トマト');
    expect(debugText).toContain('price');
  });

  test('should handle multiple rapid changes with debounce', async ({ page }) => {
    const tomatoPriceInput = page.locator('.price-input[data-product-id="product-1"]');
    const tomatoStatus = page.locator('#status-product-1');
    
    // Make multiple rapid changes
    await tomatoPriceInput.fill('200');
    await page.waitForTimeout(200);
    await tomatoPriceInput.fill('250');
    await page.waitForTimeout(200);
    await tomatoPriceInput.fill('300');
    
    // Should only save once after debounce
    await expect(tomatoStatus).toContainText('saving...', { timeout: 2000 });
    await expect(tomatoStatus).toContainText('saved', { timeout: 3000 });
    
    // Check debug to ensure only one save happened
    await page.waitForTimeout(500);
    const debugEl = page.locator('#debug');
    const debugText = await debugEl.textContent();
    
    // Count "saved" events for tomato
    const savedEvents = (debugText?.match(/"event":\s*"saved"/g) || []).length;
    expect(savedEvents).toBeLessThanOrEqual(2); // At most 2 saves (debounce should combine)
  });
});

