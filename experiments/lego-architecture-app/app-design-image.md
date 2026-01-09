2026年1月9日、後藤さん。承知いたしました。
これまでの対話で磨き上げた「レゴブロック型アーキテクチャ」の集大成を、AIコーディングエージェント（Cursor, Cline, Windsurf等）への**「マスタープロンプト兼設計仕様書」**として出力します。

このドキュメントは、エンジニアが「配管（インフラ・基盤）」を作り、ユーザーが「データ構造」を定義し、管理者が「認可」を司る、究極の柔軟性と堅牢性を両立したシステムの設計図です。

---

# 🏗️ Lego-Architecture System Master Specification

## 1. プロジェクトの全体像と設計思想

本システムは、特定の業務に特化せず、メタデータによって「データ構造」「UI」「認可」が動的に構成されるプラットフォームである。

* **絶対原則**:
1. **Drizzle ORMによる正規化**: JSONBに逃げず、型別のカラム（String, Number, Date）でデータを保持する。
2. **TypeScript一貫性**: Backendの型をtRPC経由でFrontendに100%同期する。
3. **レゴブロックUI**: 画面を手書きせず、メタデータからRefineを用いて動的にレンダリングする。
4. **ポリシーベース認可**: CASLを用い、認可ルール自体をDBマスタ化する。



---

## 2. 技術スタック (Tech Stack)

AIエージェントには以下のスタックで環境構築を命じること。

* **Runtime**: Node.js / Bun
* **Framework**: Hono (Backend) + React / Vite (Frontend)
* **Database**: PostgreSQL
* **ORM**: Drizzle ORM
* **API**: tRPC (Internal API)
* **UI Framework**: Refine (Headless Admin Framework)
* **Styling**: Tailwind CSS + shadcn/ui
* **Validation**: Zod
* **Authorization**: CASL

---

## 3. データベース・スキーマ詳細 (Drizzle ORM)

`src/db/schema.ts` に実装すべき詳細定義。

```typescript
import { pgTable, text, timestamp, doublePrecision, boolean, unique, jsonb, pgEnum } from "drizzle-orm/pg-core";

// データ型定義
export const dataTypeEnum = pgEnum("data_type", ["STRING", "NUMBER", "DATE", "SELECT"]);

// エンティティ：全ての「モノ」の核
export const items = pgTable("items", {
  id: text("id").primaryKey(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// メタデータ：ユーザーが定義する項目の設計図
export const itemMetas = pgTable("item_metas", {
  id: text("id").primaryKey(),
  key: text("key").unique().notNull(), // プログラマブルなキー名 (e.g., "price")
  label: text("label").notNull(),      // 表示名 (e.g., "販売価格")
  dataType: dataTypeEnum("data_type").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  options: jsonb("options"),           // SELECT型の場合の選択肢 [{label: "A", value: "a"}]
});

// 値の保存：正規化された実データ
export const itemValues = pgTable("item_values", {
  id: text("id").primaryKey(),
  itemId: text("item_id").references(() => items.id, { onDelete: 'cascade' }).notNull(),
  metaId: text("meta_id").references(() => itemMetas.id, { onDelete: 'cascade' }).notNull(),
  
  // 型別にカラムを分ける。性能と型安全を両立。
  valueString: text("value_string"),
  valueNumber: doublePrecision("value_number"),
  valueDate: timestamp("value_date"),
}, (t) => ({
  unq: unique().on(t.itemId, t.metaId), // 1アイテムに対し1項目の値は1つのみ
}));

// 認可ポリシー：誰が何に対して何ができるか
export const policies = pgTable("policies", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),     // e.g., "ADMIN", "EDITOR"
  action: text("action").notNull(), // e.g., "manage", "read", "update"
  subject: text("subject").notNull(), // e.g., "Item", "ItemMeta"
  conditions: jsonb("conditions"),  // CASL形式の動的条件
});

```

---

## 4. バックエンド・アーキテクチャ（配管ロジック）

### 4.1. データ変換エンジン (Flattening Layer)

DBの「縦持ち（EAV）」をアプリ層で「横持ち（Object）」に変換するコア。

* **ロジック**: `items` を `itemValues` および `itemMetas` とJOINして取得し、以下のような型安全なオブジェクトに変換する。
```typescript
{
  id: "item_1",
  status: "active", // itemMetas.key = "status" の valueString
  price: 1500,      // itemMetas.key = "price" の valueNumber
  ...
}

```



### 4.2. 動的バリデーション (Zod Factory)

`itemMetas` のレコード群を読み込み、実行時に Zod スキーマを生成する。

* `dataType` が `NUMBER` なら `z.number()`、`isRequired` が `true` なら `.nonempty()` を動的に付与。

### 4.3. 認可エンジン (CASL Integration)

`policies` テーブルを全件取得し、`Ability` インスタンスを生成するミドルウェアを実装。tRPCの各プロシージャで `ctx.ability.can(action, subject)` を実行し、権限不足なら `UNAUTHORIZED` エラーを投げる。

---

## 5. フロントエンド・アーキテクチャ（動的レンダリング）

### 5.1. Refine Data Provider の拡張

tRPCと連動し、データ取得時に「メタデータ」と「実データ」を統合して解決するカスタムプロバイダーを実装。

### 5.2. DynamicResourceRenderer コンポーネント

メタデータ `itemMetas` をループし、以下の役割を果たす。

* **一覧画面**: `dataType` に合わせた適切なカラム表示（Dateならフォーマット、Selectならラベル）。
* **編集画面**: `dataType` に基づき、`Input`, `InputNumber`, `Select` コンポーネントを動的に出し分ける。

---

## 6. AIエージェントへの段階的実装指示（Master Prompts）

AIエージェントに対し、以下の手順で実行するよう命じてください。

### ステップ1: 環境構築とベーススキーマ

> 「PostgreSQLを起動し、Drizzle ORMをセットアップせよ。`src/db/schema.ts` に提供したスキーマを実装し、マイグレーションを実行せよ。tRPCの基本ボイラープレートを作成せよ。」

### ステップ2: データマッピング層の実装

> 「`items` とその `values` を取得し、メタデータに基づいて単一のフラットなオブジェクトに変換する Repository 関数を実装せよ。この際、`valueString`, `valueNumber`, `valueDate` から正しい型を選択するロジックを緻密に書け。」

### ステップ3: 動的バリデーターと認可

> 「`itemMetas` テーブルから Zod スキーマを生成する `createDynamicSchema` 関数を実装せよ。また、CASLを用いて `policies` テーブルから認可を判定するミドルウェアを tRPC に組み込め。」

### ステップ4: RefineによるUI自動生成

> 「Refineを導入せよ。管理画面のフォームは手書きせず、`itemMetas` を `map` して動的にフォーム項目を生成する `AutoForm` コンポーネントを作成せよ。認可ポリシーをフロントエンドでも共有し、権限のないボタンは自動で非表示にすること。」

---

## 7. 後藤さんへの確約

この設計書は、**「コードとしての堅牢性（Drizzle/TypeScript）」**と**「システムとしての柔軟性（メタデータ駆動）」**を両立しています。
後藤さんが新しい「区分値」や「項目」を画面から追加したとき、このシステムは一切の再起動なしに、新しいDBカラム（に見える縦持ちデータ）を認識し、適切なバリデーションをかけ、UIを表示します。

エンジニアとしての後藤さんの役割は、この「配管」が詰まらないように監視し、どうしても汎用化できない「固有のビジネスロジック」が発生した際に、新しい `Task` クラスを一つ追加することだけです。

---

### 次にすべきこと

このドキュメントを Markdown ファイル（`design_spec.md` など）として保存し、**AIエージェントのチャット欄にアップロードして「この通りに実装を開始してくれ」と指示してください。**

最初に AI が「ディレクトリ構造の提案」をしてきたら、それを確認して承認するだけで、アプリケーションの構築が始まります。準備はよろしいでしょうか？