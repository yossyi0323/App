# 定数管理設計書

## 1. 概要
定数管理は、アプリケーション全体で使用される定数値を一元管理するための仕組みです。

## 2. ファイル構成

### 2.1 labels.ts
区分値のラベルを管理するファイルです。

```typescript
// 区分値のラベル定義
export const LABELS = {
  // 在庫確認ステータス
  INVENTORY_STATUS: {
    UNCONFIRMED: '未確認',
    CONFIRMING: '確認中',
    CONFIRMED: '確認済',
    NOT_REQUIRED: '確認不要'
  },
  // その他の区分値ラベル...
}

// 区分値の型定義
export enum RestockingPattern {
  MOVE = 'MOVE',
  CREATE = 'CREATE'
}

// その他の区分値の型定義...

// ラベル取得関数
export const getLabel = (value: string): string => {
  // 実装...
}
```

### 2.2 menu.ts
メニュー項目の定義を管理するファイルです。

```typescript
export const MENU_ITEMS = [
  {
    id: 'inventory-confirmation',
    label: '在庫確認業務',
    icon: 'mdi-clipboard-check',
    path: '/inventory-confirmation'
  },
  // その他のメニュー項目...
]
```

### 2.3 messages.ts
アプリケーションで使用するメッセージを管理するファイルです。

メッセージは以下のように区分けされています：

1. エラーメッセージ（ERROR）
   - 操作失敗時のエラーメッセージ
   - パラメータ付きメッセージに対応（関数形式）
   - 例：取得失敗、更新失敗、作成失敗、削除失敗など

2. 警告メッセージ（WARNING）
   - 注意が必要な状況のメッセージ
   - パラメータ付きメッセージに対応（関数形式）
   - 例：データ不存在、在庫不足など

3. 成功メッセージ（SUCCESS）
   - 操作成功時のメッセージ
   - パラメータ付きメッセージに対応（関数形式）
   - 例：作成成功、更新成功、削除成功、自動保存完了など

4. 通知メッセージ（NOTIFY）
   - システム通知（SYSTEM）
     - システム状態に関する通知
     - 例：セッション切れ、メンテナンス中、新バージョン通知など
   - 確認ダイアログ（CONFIRM）
     - ユーザー確認が必要な操作のメッセージ
     - パラメータ付きメッセージに対応（関数形式）
     - 例：削除確認、更新確認、作成確認、リセット確認など

```typescript
export const MESSAGES = {
  // エラーメッセージ
  ERROR: {
    FETCH_FAILED: (target: string) => `${target}の取得に失敗しました。`,
    UPDATE_FAILED: (target: string) => `${target}の更新に失敗しました。`,
    CREATE_FAILED: (target: string) => `${target}の作成に失敗しました。`,
    DELETE_FAILED: (target: string) => `${target}の削除に失敗しました。`,
    INVALID_DATE: '無効な日付が指定されました。',
    INVALID_COUNT: '予約数が無効です。'
  },
  // 警告メッセージ
  WARNING: {
    NO_DATA: (target: string) => `${target}が存在しません。`,
    INSUFFICIENT: '在庫が不足しています。'
  },
  // 成功メッセージ
  SUCCESS: {
    CREATED: (target: string) => `${target}が正常に作成されました。`,
    UPDATED: (target: string) => `${target}が正常に更新されました。`,
    DELETED: (target: string) => `${target}が正常に削除されました。`,
    AUTO_SAVE_COMPLETED: '自動保存が完了しました。'
  },
  // 通知メッセージ
  NOTIFY: {
    // システム通知
    SYSTEM: {
      SESSION_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください。',
      MAINTENANCE: 'システムメンテナンス中です。しばらくお待ちください。',
      NEW_VERSION: '新しいバージョンが利用可能です。更新してください。',
      AUTO_SAVE_STARTED: '自動保存を開始しました。',
      SAVING: '保存中...',
      LAST_SAVED: (time: string) => `最終保存: ${time}`,
      SAVE_FAILED: '保存に失敗しました'
    },
    // 確認ダイアログ
    CONFIRM: {
      DELETE: (target: string) => `${target}を削除してもよろしいですか？`,
      UPDATE: (target: string) => `${target}を更新してもよろしいですか？`,
      CREATE: (target: string) => `${target}を作成してもよろしいですか？`,
      RESET: (target: string) => `${target}をリセットしてもよろしいですか？`
    }
  }
} as const;
```

### 2.4 config.ts
アプリケーションの設定値を管理するファイルです。

```typescript
export const CONFIG = {
  // API設定
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    TIMEOUT: 30000
  },
  // その他の設定...
}
```

## 3. 使用方法

### 3.1 ラベルの使用
```typescript
import { LABELS, getLabel } from '@/constants/labels'

// 直接参照
const label = LABELS.INVENTORY_STATUS.CONFIRMED

// 関数を使用
const label = getLabel(InventoryStatus.CONFIRMED)
```

### 3.2 メニュー項目の使用
```typescript
import { MENU_ITEMS } from '@/constants/menu'

// メニュー項目の取得
const menuItems = MENU_ITEMS
```

### 3.3 メッセージの使用
```typescript
import { MESSAGES } from '@/constants/messages'

// エラーメッセージの使用（パラメータ付き）
const errorMessage = MESSAGES.ERROR.FETCH_FAILED('商品データ')

// 警告メッセージの使用（パラメータ付き）
const warningMessage = MESSAGES.WARNING.NO_DATA('商品データ')

// 成功メッセージの使用（パラメータ付き）
const successMessage = MESSAGES.SUCCESS.CREATED('商品データ')

// システム通知の使用
const systemMessage = MESSAGES.NOTIFY.SYSTEM.SESSION_EXPIRED

// 確認ダイアログの使用（パラメータ付き）
const confirmMessage = MESSAGES.NOTIFY.CONFIRM.DELETE('商品データ')
```

### 3.4 設定値の使用
```typescript
import { CONFIG } from '@/constants/config'

// APIのベースURLの取得
const baseUrl = CONFIG.API.BASE_URL
```

## 4. 関連ドキュメント
- [区分値管理設計書](../classification_values.md)
- [ラベル管理設計書](../label_management.md)
- [アプリケーション全体の設計](../../アプリケーション概念設計ノート.md) 