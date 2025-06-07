# Composables設計書

## 1. 概要
Composablesは、Vue.jsのコンポジションAPIを使用して作成された再利用可能なロジックの集まりです。

### 【自動保存の信頼性要件】
- 保存処理は「DBへの書き込み成功」をもって完了とみなすこと
- 一時的な失敗時は必ずリトライし、値がDBに到達するまで再送を継続すること
- データはlocalStorageに一時保存し、必ずDBまで同期すること
- 保存失敗時はユーザーに明確に通知し、再保存の導線を用意すること
- 同じ値が複数回保存されるのは許容するが、保存されないことは絶対に許容しない

## 2. ファイル構成

### 2.1 useApi.ts
API通信に関する共通ロジックを管理するファイルです。

```typescript
// API通信の基本設定
const api = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  timeout: CONFIG.API.TIMEOUT
})

// API通信の共通処理
export const useApi = () => {
  // GETリクエスト
  const get = async <T>(url: string, params?: any): Promise<T> => {
    // 実装...
  }

  // POSTリクエスト
  const post = async <T>(url: string, data?: any): Promise<T> => {
    // 実装...
  }

  // PUTリクエスト
  const put = async <T>(url: string, data?: any): Promise<T> => {
    // 実装...
  }

  // DELETEリクエスト
  const del = async <T>(url: string): Promise<T> => {
    // 実装...
  }

  return {
    get,
    post,
    put,
    del
  }
}
```

### 2.2 useAutoSave.ts
自動保存機能に関する共通ロジックを管理するファイルです。

```typescript
// 自動保存の設定
const AUTO_SAVE_INTERVAL = 5000 // 5秒

export const useAutoSave = (saveFunction: () => Promise<void>) => {
  // 自動保存の状態管理
  const isSaving = ref(false)
  const lastSaved = ref<Date | null>(null)
  const error = ref<Error | null>(null)

  // 自動保存の実行
  const autoSave = async () => {
    // 実装...
  }

  // 自動保存の開始
  const startAutoSave = () => {
    // 実装...
  }

  // 自動保存の停止
  const stopAutoSave = () => {
    // 実装...
  }

  return {
    isSaving,
    lastSaved,
    error,
    startAutoSave,
    stopAutoSave
  }
}
```

## 3. 使用方法

### 3.1 API通信の使用
```typescript
import { useApi } from '@/composables/useApi'

// API通信のインスタンス作成
const { get, post, put, del } = useApi()

// GETリクエストの実行
const fetchData = async () => {
  try {
    const data = await get<ResponseType>('/api/endpoint')
    // 処理...
  } catch (error) {
    // エラー処理...
  }
}
```

### 3.2 自動保存機能の使用
```typescript
import { useAutoSave } from '@/composables/useAutoSave'

// 保存処理の定義
const saveData = async () => {
  // 保存処理の実装...
}

// 自動保存機能のインスタンス作成
const { isSaving, lastSaved, error, startAutoSave, stopAutoSave } = useAutoSave(saveData)

// 自動保存の開始
onMounted(() => {
  startAutoSave()
})

// 自動保存の停止
onUnmounted(() => {
  stopAutoSave()
})
```

## 4. 関連ドキュメント
- [定数管理設計書](../constants/constants_design.md)
- [アプリケーション全体の設計](../../アプリケーション概念設計ノート.md) 