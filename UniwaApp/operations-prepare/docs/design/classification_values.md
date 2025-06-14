# 区分値管理設計書

## 1. 概要

区分値は、アプリケーション全体で使用される定数値の管理を行うための仕組みです。

本設計書では、区分種別・区分値の管理構造、追加・更新手順、論理名・物理名・表示名の使い分けと呼び出し方法について記載します。

## 2. 管理方法

区分値は以下の方法で管理されます：

### 2.1 ファイル構成

区分値は以下のファイルで管理します：

```
lib/
  schemas/
    enum-definitions.ts  # 区分値の基本スキーマと型定義
    enums/              # 区分値の定義
      place-type.ts     # 場所タイプの区分値（型エイリアスもここでexport）
      ...
  utils/
    enum-utils.ts       # 区分値の操作に関する共通機能
```

### 2.2 定義方法

- 区分値は`enum-definitions.ts`でzodスキーマを定義し、各区分値は`enums/`配下でオブジェクトとして定義します。
- **型エイリアス（XXCode）は各enum定義ファイルでexportします。**
- 例：

```typescript
// lib/schemas/enums/place-type.ts
export const PLACE_TYPE = { ... } as const;
export type PlaceTypeCode = typeof PLACE_TYPE.values[number]['code'];
```

### 2.3 命名規則

- 区分種別の論理名（categoryLogicalName）：大文字スネークケース（例：`PLACE_TYPE`）
- 区分値の論理名（logicalName）：大文字スネークケース（例：`DESTINATION`）
- 区分値の物理名（code）：2桁英数字（例：'01', 'B3'）
- 区分値の表示名（displayName）：日本語（例：'補充先'）

## 3. 区分値の追加・更新例

### 3.1 新しい区分値の追加

例：「線の太さ（LINE_WIDTH）」を追加する場合：

1. `lib/schemas/enums/line-width.ts`を新規作成

```typescript
export const LINE_WIDTH = {
  categoryCode: '03',
  categoryDisplayName: '線の太さ',
  categoryLogicalName: 'LINE_WIDTH',
  values: [
    { code: '01', displayName: '細い', logicalName: 'THIN' },
    { code: '02', displayName: '普通', logicalName: 'NORMAL' },
    { code: '03', displayName: '太い', logicalName: 'THICK' },
  ],
} as const;
export type LineWidthCode = (typeof LINE_WIDTH.values)[number]['code'];
```

2. 既存区分値の更新（例：表示名の修正や値の追加）

- `values`配列に新しいオブジェクトを追加、または`displayName`を修正

## 4. 論理名・物理名・表示名の使い方

### 4.1 共通ユーティリティ関数の利用

`lib/utils/enum-utils.ts`で以下の関数を用意します：

```typescript
export function getEnumValues(enumObj: any) {
  return enumObj.values.map(({ logicalName, displayName }: any) => ({ logicalName, displayName }));
}
export function getCode(enumObj: any, logicalName: string) {
  return enumObj.values.find((v: any) => v.logicalName === logicalName)?.code;
}
export function getLogicalName(enumObj: any, code: string) {
  return enumObj.values.find((v: any) => v.code === code)?.logicalName;
}
export function getDisplayName(enumObj: any, logicalName: string) {
  return enumObj.values.find((v: any) => v.logicalName === logicalName)?.displayName;
}
```

### 4.2 利用例

```typescript
import { PLACE_TYPE, PlaceTypeCode } from '@/lib/schemas/enums/place-type';
import { getDisplayName, getEnumValues, getCode, getLogicalName } from '@/lib/utils/enum-utils';

// 1. 区分値の一覧取得
const values = getEnumValues(PLACE_TYPE);
// 結果: [{ logicalName: 'DESTINATION', displayName: '補充先' }, ...]

// 2. コードの取得
const code: PlaceTypeCode = getCode(PLACE_TYPE, 'DESTINATION'); // '01'

// 3. 論理名の取得
const logicalName = getLogicalName(PLACE_TYPE, '01'); // 'DESTINATION'

// 4. 表示名の取得
const displayName = getDisplayName(PLACE_TYPE, 'DESTINATION'); // '補充先'
```

## 5. 注意事項

- 区分値の追加・変更は、アプリケーション全体に影響するため慎重に行うこと
- 区分値のコード（物理名）は一意であること
- 区分値の論理名は意味が明確で一意であること
- 区分値の表示名はユーザーに分かりやすい日本語を使用すること
- 区分値の追加は`enums/`ディレクトリに新しいファイルを追加するだけで完了
- 型エイリアスもenum定義ファイルでexportすること
- `enum-definitions.ts`や`enum-utils.ts`の修正は原則不要

## 7. 使用方法

### 7.1 フロントエンドでの使用例

```typescript
import { InventoryStatus } from '@/constants/labels';

// 区分値の使用
const status = InventoryStatus.CONFIRMED;

// ラベルの取得
const label = getLabel(InventoryStatus.CONFIRMED);
```

### 7.2 バックエンドでの使用例

```java
@Enumerated(EnumType.STRING)
private InventoryStatus inventoryStatus;
```

## 8. 関連ドキュメント

- [区分値一覧](classification_value_list.md)
- [ラベル管理設計書](label_management.md)
- [アプリケーション全体の設計](../アプリケーション概念設計ノート.md)
