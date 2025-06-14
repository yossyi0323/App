# 在庫アイテムカード（inventory-item-card.tsx）テスト仕様書

## 1. テスト概要

在庫アイテムカードコンポーネントの主要機能をテストし、以下の点を確認します：

- アイテム情報の表示
- 在庫数・補充数の入力
- 補充要否の切り替え
- メモ欄の開閉
- 補充済状態での入力制限

## 2. テストケース

### 2.1 初期表示テスト

#### 確認条件

- コンポーネントを表示した時の初期状態

#### 想定結果

- アイテム名が表示される
- 在庫数入力欄が表示される
- 補充数入力欄が表示される
- 補充要否トグルが表示される
- メモ欄が閉じた状態で表示される

### 2.2 在庫数入力テスト

#### 確認条件

- 在庫数を入力した時

#### 想定結果

- `onStockChange`コールバックが呼ばれる
- 入力値が正しく反映される
- 補充済状態でない場合のみ入力可能

### 2.3 補充数入力テスト

#### 確認条件

- 補充数を入力した時

#### 想定結果

- `onRestockChange`コールバックが呼ばれる
- 入力値が正しく反映される
- 補充済状態でない場合のみ入力可能

### 2.4 補充要否切り替えテスト

#### 確認条件

- 補充要否トグルを切り替えた時

#### 想定結果

- `onNeedsRestockChange`コールバックが呼ばれる
- トグルの状態が正しく反映される
- 補充済状態でない場合のみ切り替え可能

### 2.5 メモ欄操作テスト

#### 確認条件

- メモ欄を開いた時

#### 想定結果

- メモ入力欄が表示される
- メモの内容が正しく表示される

#### 確認条件

- メモを入力した時

#### 想定結果

- `onMemoChange`コールバックが呼ばれる
- 入力値が正しく反映される

### 2.6 補充済状態テスト

#### 確認条件

- `replenishmentStatus`が'restocked'の場合

#### 想定結果

- 在庫数入力欄が無効化される
- 補充数入力欄が無効化される
- 補充要否トグルが無効化される

## 3. テストデータ

### 3.1 モックデータ

```typescript
const mockItem = {
  item_id: '1',
  item_name: '商品A',
  current_stock: 0,
  replenishment_count: 0,
  replenishment_status: 'not-required',
  memo: '',
};

const mockProps = {
  item: mockItem,
  date: '2024-03-20',
  currentStock: 0,
  restockAmount: 0,
  replenishmentStatus: 'not-required',
  memo: '',
  onStockChange: jest.fn(),
  onRestockChange: jest.fn(),
  onNeedsRestockChange: jest.fn(),
  onMemoChange: jest.fn(),
};
```

## 4. テスト実行手順

1. テスト環境のセットアップ

   ```bash
   npm install
   npm test
   ```

2. 特定のテストの実行
   ```bash
   npm test inventory-item-card.test.tsx
   ```

## 5. 注意事項

- 入力値のバリデーションが正しく機能することを確認
- コールバック関数が適切なタイミングで呼ばれることを確認
- 補充済状態での入力制限が正しく機能することを確認
- メモ欄の開閉状態が正しく保持されることを確認
