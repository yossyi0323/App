# Storybook 導入手順

## 概要
Vue.jsコンポーネントをカタログ化し、アプリ全体を起動せずに個別のコンポーネントを確認・テストできるようにします。

## インストール

```bash
cd frontend
npx storybook@latest init
```

**注意：** 自動検出でVue.jsプロジェクトとして認識されます。途中の質問には「y」で答えてOK。

## インストール後の確認

### 1. package.jsonにスクリプトが追加される
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### 2. 起動
```bash
npm run storybook
```
→ http://localhost:6006 でStorybookが開く

## ストーリーの作成

### 例：InventoryItemCard.stories.js

`src/components/InventoryItemCard.stories.js` を作成：

```javascript
import InventoryItemCard from './InventoryItemCard.vue';

export default {
  title: 'Components/InventoryItemCard',
  component: InventoryItemCard,
};

// 未確認状態
export const Unconfirmed = {
  args: {
    inventoryStatus: {
      id: '1',
      item: {
        name: 'じゃがいも',
        unit: '個'
      },
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '補充不要',
      inventoryCount: 10,
      replenishmentCount: 0
    }
  }
};

// 要補充状態
export const NeedsReplenishment = {
  args: {
    inventoryStatus: {
      id: '2',
      item: {
        name: 'にんじん',
        unit: '本'
      },
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '要補充',
      inventoryCount: 2,
      replenishmentCount: 10
    }
  }
};

// 確認済み状態
export const Confirmed = {
  args: {
    inventoryStatus: {
      id: '3',
      item: {
        name: 'トマト',
        unit: '個'
      },
      inventoryCheckStatus: '確認済',
      replenishmentStatus: '補充不要',
      inventoryCount: 15,
      replenishmentCount: 0
    }
  }
};
```

## メリット

- **開発効率UP**：アプリ全体を起動せずにコンポーネント確認
- **デザイン確認が楽**：色々なパターンを一覧表示
- **動くドキュメント**：使い方が一目瞭然
- **リグレッションテスト**：見た目の変更を確認しやすい

## デメリット

- 初期セットアップの手間
- ストーリーファイルを書く手間
- ビルド時間が少し増える

## 推奨する使い方（moc-appの場合）

### 優先度高：共通コンポーネント
- InventoryItemCard
- ReplenishItemCard
- OrderItemCard
- CreationItemCard

→ 色々な画面で使い回すので、ストーリーを作る価値あり

### 優先度低：View（画面全体）
- HomeView
- InventoryView
- StatusView

→ View全体は複雑すぎるので、ストーリーを作る必要性は低い

## 次のステップ

- [ ] InventoryItemCardのストーリーを作成
- [ ] 他のカード系コンポーネントのストーリーを作成
- [ ] 共通部品が増えたらストーリーも追加

