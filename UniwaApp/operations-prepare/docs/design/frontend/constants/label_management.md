# ラベル管理設計書

## 1. 概要
ラベル管理は、アプリケーション全体で使用されるテキストやメッセージを一元管理するための仕組みです。

## 2. 管理方法
ラベルは以下の方法で管理されます：

1. フロントエンド側
   - `src/main/frontend/src/constants/labels.ts`で区分値のラベルを管理
   - `src/main/frontend/src/constants/messages.ts`でメッセージを管理
   - TypeScriptの型安全性を確保
   - 多言語対応の準備

## 3. ラベル一覧

### 3.1 区分値ラベル
```typescript
// labels.ts
export const LABELS = {
  // 在庫確認ステータス
  INVENTORY_STATUS: {
    UNCONFIRMED: '未確認',
    CONFIRMING: '確認中',
    CONFIRMED: '確認済',
    NOT_REQUIRED: '確認不要'
  },
  // 補充ステータス
  RESTOCKING_STATUS: {
    NOT_REQUIRED: '補充不要',
    REQUIRED: '要補充',
    COMPLETED: '補充済'
  },
  // 作成ステータス
  PREPARATION_STATUS: {
    NOT_REQUIRED: '作成不要',
    REQUIRED: '要作成',
    COMPLETED: '作成済',
    REQUESTED: '作成依頼済'
  },
  // 発注依頼ステータス
  ORDER_REQUEST_STATUS: {
    NOT_REQUIRED: '発注不要',
    REQUIRED: '要発注依頼',
    REQUESTED: '発注依頼済'
  },
  // 補充元先区分
  LOCATION_TYPE: {
    SOURCE: '補充元',
    DESTINATION: '補充先'
  }
}
```

### 3.2 メッセージ
```typescript
// messages.ts
export const MESSAGES = {
  // 共通メッセージ
  COMMON: {
    SAVE_SUCCESS: '保存が完了しました',
    SAVE_ERROR: '保存に失敗しました',
    DELETE_SUCCESS: '削除が完了しました',
    DELETE_ERROR: '削除に失敗しました',
    CONFIRM_DELETE: '本当に削除しますか？'
  },
  // エラーメッセージ
  ERROR: {
    REQUIRED: '{0}は必須です',
    INVALID_FORMAT: '{0}の形式が正しくありません',
    NETWORK_ERROR: '通信エラーが発生しました'
  }
}
```

## 4. 使用方法

### 4.1 ラベルの取得
```typescript
import { LABELS, getLabel } from '@/constants/labels'

// 直接参照
const label = LABELS.INVENTORY_STATUS.CONFIRMED

// 関数を使用
const label = getLabel(InventoryStatus.CONFIRMED)
```

### 4.2 メッセージの取得
```typescript
import { MESSAGES } from '@/constants/messages'

// 直接参照
const message = MESSAGES.COMMON.SAVE_SUCCESS

// パラメータ付きメッセージ
const message = formatMessage(MESSAGES.ERROR.REQUIRED, ['商品名'])
```

## 5. 関連ドキュメント
- [区分値管理設計書](classification_values.md)
- [アプリケーション全体の設計](../アプリケーション概念設計ノート.md) 