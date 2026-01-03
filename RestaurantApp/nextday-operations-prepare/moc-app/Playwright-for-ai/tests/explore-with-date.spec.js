// tests/explore-with-date.spec.js - 日付を変更してからmoc-appを探索する

import { test, expect } from '@playwright/test';

// ターゲット日付（DBにデータがある日付）
const TARGET_DATE = '2025年9月27日';
const TARGET_MONTH_YEAR = '9月 2025';

test('業務日付を2025/09/27に変更してから全画面を探索', async ({ page }) => {
  console.log('=== 日付変更＋全画面探索開始 ===');
  
  // 1. トップページにアクセス
  console.log('1. トップページにアクセス...');
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // 2. 業務日付を変更
  console.log('2. 業務日付を2025/09/27に変更...');
  
  try {
    // 日付入力欄を見つけて値を設定
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2025-09-27');
    
    // changeイベントをトリガー（重要！）
    await dateInput.dispatchEvent('change');
    await page.waitForTimeout(1000);
    
    const value = await dateInput.inputValue();
    console.log(`  業務日付更新: ${value}`);
    
  } catch (error) {
    console.log(`  日付変更でエラー: ${error.message}`);
    console.log('  日付変更をスキップして続行します...');
  }
  
  await page.screenshot({ path: 'test-results/date-changed/01-home.png', fullPage: true });
  
  // 3. 各ページを探索
  const routes = [
    { path: '/inventory', name: '在庫確認' },
    { path: '/replenishment', name: '補充' },
    { path: '/creation', name: '作成' },
    { path: '/order', name: '発注' },
    { path: '/status', name: 'ステータス' },
  ];
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    console.log(`${i + 3}. ${route.name}ページ (${route.path}) にアクセス...`);
    
    try {
      await page.goto(route.path);
      await page.waitForTimeout(1500); // データ読み込み待ち
      
      await page.screenshot({ 
        path: `test-results/date-changed/${String(i + 2).padStart(2, '0')}-${route.name}.png`, 
        fullPage: true 
      });
      
      // ページ内容を調査
      const pageText = await page.locator('body').textContent();
      
      // データがあるか確認
      if (pageText.includes('ありません') || pageText.includes('がありません')) {
        console.log(`  → データなし`);
      } else {
        // カード要素やテーブルを数える
        const cards = await page.locator('[class*="card"]').all();
        const tables = await page.locator('table').all();
        console.log(`  → カード: ${cards.length}個, テーブル: ${tables.length}個`);
      }
      
    } catch (error) {
      console.log(`  エラー: ${error.message}`);
    }
  }
  
  console.log('=== 探索完了 ===');
});

test('在庫確認ページで詳細に要素を確認（2025/09/27）', async ({ page }) => {
  console.log('=== 在庫確認ページ詳細確認（データあり） ===');
  
  // 日付を変更してから在庫確認ページへ
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // 日付変更
  try {
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2025-09-27');
    await dateInput.dispatchEvent('change');
    await page.waitForTimeout(1000);
    console.log('日付を2025-09-27に変更しました');
  } catch (error) {
    console.log(`日付変更エラー: ${error.message}`);
  }
  
  // 在庫確認ページへ
  await page.goto('/inventory');
  await page.waitForTimeout(1500);
  
  // 補充先があるか確認
  const selects = await page.locator('select').all();
  if (selects.length > 0) {
    console.log(`補充先セレクトボックス: ${selects.length}個`);
    
    // 最初のselectの選択肢を確認
    const options = await selects[0].locator('option').all();
    console.log(`選択肢の数: ${options.length}個`);
    
    for (const option of options) {
      const text = await option.textContent();
      console.log(`  - ${text}`);
    }
  }
  
  // カード要素を確認
  const cards = await page.locator('[class*="card"]').all();
  console.log(`カード要素: ${cards.length}個`);
  
  // テーブルを確認
  const tables = await page.locator('table').all();
  console.log(`テーブル: ${tables.length}個`);
  
  // リスト項目を確認
  const listItems = await page.locator('li').all();
  console.log(`リスト項目: ${listItems.length}個`);
  
  await page.screenshot({ path: 'test-results/date-changed/inventory-detail.png', fullPage: true });
  
  console.log('=== 詳細確認完了 ===');
});

