// tests/explore-app.spec.js - moc-appを探索するスクリプト

import { test, expect } from '@playwright/test';

test('moc-appの全画面を探索する', async ({ page }) => {
  console.log('=== moc-app探索開始 ===');
  
  // 1. トップページ（Home）
  console.log('1. トップページにアクセス...');
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/01-home.png', fullPage: true });
  
  const title = await page.title();
  console.log(`ページタイトル: ${title}`);
  
  // ページ内のボタンやリンクを探す
  const buttons = await page.locator('button').all();
  console.log(`ボタンの数: ${buttons.length}`);
  
  const links = await page.locator('a').all();
  console.log(`リンクの数: ${links.length}`);
  
  // 2. 各ページへのナビゲーションを試す
  const routes = [
    { path: '/inventory', name: '在庫確認' },
    { path: '/replenishment', name: '補充' },
    { path: '/creation', name: '作成' },
    { path: '/order', name: '発注' },
    { path: '/status', name: 'ステータス' },
  ];
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    console.log(`${i + 2}. ${route.name}ページ (${route.path}) にアクセス...`);
    
    try {
      await page.goto(route.path);
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: `test-results/${String(i + 2).padStart(2, '0')}-${route.name}.png`, 
        fullPage: true 
      });
      
      // ページ内のテキストを取得
      const pageText = await page.locator('body').textContent();
      console.log(`ページ内容（最初の100文字）: ${pageText.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`エラー: ${route.name}ページにアクセスできませんでした - ${error.message}`);
    }
  }
  
  console.log('=== 探索完了 ===');
});

test('在庫確認ページで要素を詳しく調査', async ({ page }) => {
  console.log('=== 在庫確認ページ詳細調査 ===');
  
  await page.goto('/inventory');
  await page.waitForTimeout(1000);
  
  // h1タイトルを探す
  const h1Elements = await page.locator('h1').all();
  for (const h1 of h1Elements) {
    const text = await h1.textContent();
    console.log(`H1タイトル: ${text}`);
  }
  
  // フォーム要素を探す
  const inputs = await page.locator('input').all();
  console.log(`入力欄の数: ${inputs.length}`);
  
  const selects = await page.locator('select').all();
  console.log(`セレクトボックスの数: ${selects.length}`);
  
  // テーブルやリストを探す
  const tables = await page.locator('table').all();
  console.log(`テーブルの数: ${tables.length}`);
  
  // カードやアイテムを探す
  const cards = await page.locator('[class*="card"]').all();
  console.log(`カード要素の数: ${cards.length}`);
  
  await page.screenshot({ path: 'test-results/inventory-detail.png', fullPage: true });
  
  console.log('=== 詳細調査完了 ===');
});

