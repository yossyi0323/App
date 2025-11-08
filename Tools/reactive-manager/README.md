# @tools/reactive-manager

画面操作に呼応してデータを自動的に同期・保存するライブラリ。REST API統合、debounce自動保存、楽観ロック対応。

## 特徴

- **自動保存**: 入力停止後に自動的にデバウンス保存
- **REST API自動対応**: baseURLを指定するだけで標準CRUD操作を自動生成
- **カスタム操作**: 任意の操作（チェック、承認など）を自由に追加
- **楽観ロック**: versionベースの競合検出
- **状態管理**: 保存中・保存完了などの状態を追跡
- **フレームワーク非依存**: React、Vue、Vanilla JSで動作
- **型安全**: TypeScriptで完全な型サポート

## インストール

### モノレポ内で使用

```json
{
  "dependencies": {
    "@tools/reactive-manager": "workspace:*"
  }
}
```

### 単体プロジェクトで使用

```json
{
  "dependencies": {
    "@tools/reactive-manager": "file:../../Tools/reactive-manager"
  }
}
```

## クイックスタート

### 1. エンティティキー定数を定義

```typescript
// entities.ts
export const ENTITY = {
  ITEM: 'item',
  ORDER: 'order',
  RESERVATION: 'reservation',
} as const;
```

### 2. ReactiveManagerを初期化・登録

```typescript
// reactiveManager.ts
import { createReactiveManager } from '@tools/reactive-manager';
import { ENTITY } from './entities';

const manager = createReactiveManager();

// REST API自動対応
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items', // これだけで標準CRUD自動生成
  debounceMs: 1000,
  
  onStateChange: (state) => {
    if (state === 'saving') showStatus('保存中...');
    if (state === 'saved') showStatus('保存しました');
  },
});

export default manager;
```

### 3. 使用側で呼び出し

```typescript
// コンポーネント
import manager from './reactiveManager';
import { ENTITY } from './entities';

const item = { id: '123', name: 'test', version: 1 };

// 自動保存（debounce付き）
manager.save(ENTITY.ITEM, item);

// 即座に保存
await manager.save(ENTITY.ITEM, item, { immediate: true });

// 削除
await manager.delete(ENTITY.ITEM, '123', { immediate: true });
```

## API仕様

### 初期化

```typescript
createReactiveManager(config?)
  config: {
    defaultDebounceMs?: number,  // デフォルト: 1000
    onError?: (error: Error) => void
  }
```

### エンティティ登録

```typescript
manager.register(entityKey: string, config: {
  // REST API自動対応
  baseUrl?: string,  // '/api/items' - これだけで標準CRUD自動生成
  
  // 標準CRUD（手動設定）
  get?: (id?: string) => Promise<T>,
  post?: (data: T) => Promise<T>,
  put?: (data: T) => Promise<T>,
  save?: (data: T) => Promise<T>,
  delete?: (id: string) => Promise<void>,
  
  // カスタム操作（自由に追加可能）
  check?: (data: T) => Promise<any>,
  approve?: (id: string) => Promise<void>,
  validate?: (data: T) => Promise<boolean>,
  // ... 任意の操作
  
  // 設定
  debounceMs?: number,
  
  // ライフサイクル
  validateBeforeSave?: (data: T) => boolean | string,
  onBeforeSave?: (data: T) => T,
  onAfterSave?: (data: T) => void,
  onStateChange?: (state: SaveState, data?: T) => void,
  onSaved?: (data: T) => void,
  onError?: (error: Error) => void,
  onConflict?: (data: T) => void,
})
```

### CRUD操作

```typescript
// GET
await manager.get(entityKey, id?)  // Promise<T | T[]>

// POST（新規作成）
await manager.post(entityKey, data, options?)  // Promise<T>

// PUT（更新、debounce付き）
await manager.put(entityKey, data, options?)  // Promise<T>

// SAVE（POST/PUT自動判定、debounce付き）
await manager.save(entityKey, data, options?)  // Promise<T>

// DELETE
await manager.delete(entityKey, idOrData, options?)  // Promise<void>

// カスタム操作
await manager.call(entityKey, operationName, ...args)  // Promise<any>

// オプション
options: {
  immediate?: boolean  // trueの場合、debounceをバイパスして即座に実行
}
```

### 状態確認

```typescript
manager.isSaving()  // boolean - 何か保存中か
manager.hasUnsavedChanges()  // boolean - 未保存の変更があるか
manager.getUnsavedCount()  // number - 未保存アイテム数
manager.getSaveState(entityKey, id)  // SaveState - 特定アイテムの保存状態
```

## 使用例

### REST API自動対応

`baseUrl`を指定するだけで標準CRUD操作を自動生成：

```typescript
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items'
});

// 自動生成される操作：
// GET    /api/items/{id}     → manager.get(ENTITY.ITEM, id)
// GET    /api/items          → manager.get(ENTITY.ITEM)
// POST   /api/items          → manager.post(ENTITY.ITEM, data)
// PUT    /api/items/{id}     → manager.put(ENTITY.ITEM, data)
// DELETE /api/items/{id}     → manager.delete(ENTITY.ITEM, id)
```

### カスタム操作の追加

```typescript
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items',
  
  // カスタム操作を自由に追加
  check: (data) => fetch(`/api/items/${data.id}/check`, {...}).then(r => r.json()),
  approve: (id) => fetch(`/api/items/${id}/approve`, { method: 'POST' }),
});

// 使用
const checkResult = await manager.call(ENTITY.ITEM, 'check', item);
await manager.call(ENTITY.ITEM, 'approve', '123');
```

### バリデーション

```typescript
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items',
  
  validateBeforeSave: (data) => {
    if (!data.name) return '名前は必須です';
    if (data.price < 0) return '価格は0以上である必要があります';
    return true;
  },
});
```

### データ変換

```typescript
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items',
  
  onBeforeSave: (data) => ({
    ...data,
    updatedAt: new Date().toISOString(),
  }),
  
  onAfterSave: (data) => {
    console.log('保存完了:', data);
  },
});
```

## フレームワーク別の使用例

### Vanilla JavaScript/TypeScript

```typescript
const nameInput = document.getElementById('name') as HTMLInputElement;

nameInput.addEventListener('input', () => {
  const item = {
    id: '123',
    name: nameInput.value,
    version: 1,
  };
  
  manager.save(ENTITY.ITEM, item);
});
```

### React

```typescript
import { useState, useEffect, useRef } from 'react';
import { createReactiveManager } from '@tools/reactive-manager';

function useItemManager() {
  const [item, setItem] = useState({ id: '123', name: '', version: 1 });
  const [saveStatus, setSaveStatus] = useState('');
  const managerRef = useRef(createReactiveManager());

  useEffect(() => {
    managerRef.current.register(ENTITY.ITEM, {
      baseUrl: '/api/items',
      onStateChange: (state) => {
        if (state === 'saving') setSaveStatus('保存中...');
        if (state === 'saved') {
          setSaveStatus('保存しました');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      },
    });
  }, []);

  const saveItem = (updatedItem) => {
    setItem(updatedItem);
    managerRef.current.save(ENTITY.ITEM, updatedItem);
  };

  return { item, saveStatus, saveItem };
}
```

### Vue 3 Composition API

```typescript
import { ref, onMounted } from 'vue';
import { createReactiveManager } from '@tools/reactive-manager';

export function useItemManager() {
  const manager = createReactiveManager();
  const item = ref({ id: '123', name: '', version: 1 });
  const saveStatus = ref('');

  onMounted(() => {
    manager.register(ENTITY.ITEM, {
      baseUrl: '/api/items',
      onStateChange: (state) => {
        if (state === 'saving') saveStatus.value = '保存中...';
        if (state === 'saved') {
          saveStatus.value = '保存しました';
          setTimeout(() => { saveStatus.value = ''; }, 2000);
        }
      },
    });
  });

  const saveItem = () => {
    manager.save(ENTITY.ITEM, item.value);
  };

  return { item, saveStatus, saveItem };
}
```

## 楽観ロック

データに`version`フィールドが必須です。バックエンドは更新時にversionをチェックし、競合時に409ステータスを返す必要があります。

```typescript
interface Item {
  id: string;
  name: string;
  version: number;  // 必須
}

// 競合発生時のハンドリング
manager.register(ENTITY.ITEM, {
  baseUrl: '/api/items',
  onConflict: (data) => {
    alert('他のユーザーが更新しました。ページをリロードしてください。');
    location.reload();
  },
});
```

## デモ

```bash
cd Tools/reactive-manager
npm install
npm run demo
```

ブラウザで http://localhost:5173 を開いてデモを確認できます。

## テスト

```bash
npm test
```

## 開発

```bash
# ビルド
npm run build

# テスト（watch mode）
npm run test:watch
```

## ディレクトリ構造

```
reactive-manager/
├── src/
│   ├── reactive-manager.ts      # メインクラス
│   ├── entity-registry.ts       # エンティティ登録管理
│   ├── rest-adapter.ts          # REST API自動生成
│   ├── debounce.ts              # Debounce機能
│   ├── dirty-tracker.ts         # Dirty tracking
│   ├── types.ts                 # 型定義
│   └── index.ts                 # エクスポート
├── demo/
│   ├── index.html               # デモページ
│   └── demo.ts                  # デモロジック
├── examples/
│   ├── vanilla.ts               # Vanilla JS例
│   ├── vue.ts                   # Vue例
│   └── react.tsx                # React例
├── __tests__/
│   └── reactive-manager.test.ts # ユニットテスト
├── package.json
├── tsconfig.json
└── README.md
```

## 設計思想

1. **シンプルさ**: 複雑な設定を避け、直感的なAPI
2. **柔軟性**: REST API自動対応とカスタム操作の両立
3. **型安全**: TypeScriptで完全な型サポート
4. **フレームワーク非依存**: どんな環境でも動作
5. **拡張性**: カスタム操作を自由に追加可能

## ライセンス

MIT

## 関連ドキュメント

- 開発ガイド: `App/Tools/docs/tools-development-guide.md`
- 既存の auto-save との違い: reactive-manager は複数エンティティ、カスタム操作、REST API自動対応を備えた高機能版

