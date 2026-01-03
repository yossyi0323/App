# 補助ツール：品物マスタ一括インポートスクリプト

## 概要

このツールは、CSVファイル（`data/items.csv`）から品物マスタ・準備情報を一括でSupabaseに登録・更新するための補助スクリプトです。

- スクリプト本体：`scripts/import-items.ts`
- 入力データ：`data/items.csv`
- 主な用途：初期データ投入、大量一括更新、マスタメンテナンス

---

## 使い方

### 1. CSVファイルの準備

- `data/items.csv` を編集し、品物情報を記載します。
- フォーマット例：

```
品物名,補充パターン区分,補充元場所名,補充先場所名,作成・発注依頼先
塩,MOVE,調味料棚,2階,
砂糖,MOVE,調味料棚,2階,
...（以下省略）
```

### 2. スクリプトの実行

プロジェクトルートで以下のコマンドを実行します：

```
npx ts-node -r tsconfig-paths/register scripts/import-items.ts
```

- Supabaseの接続情報は `.env` で管理されている必要があります。
- 実行結果はコンソールに出力されます。
- **@エイリアスimportを使っているため、必ず `-r tsconfig-paths/register` を付けて実行してください。**
- npm script例：
  ```json
  "scripts": {
    "import-items": "ts-node -r tsconfig-paths/register scripts/import-items.ts"
  }
  ```
  これにより `npm run import-items` でも実行できます。

### 3. 主な処理内容

- 取り込み前の既存データを、取り込み用CSVの形式でバックアップ（bk_item.csvに格納）
- CSVをパースし、各品物ごとに：
  - 場所名→ID変換（DB参照）
  - 区分値（論理名→code）変換
  - 既存品物はupdate、新規はinsert
  - 準備情報（item_preparation）も同時登録
- エラー時は該当行をスキップし、エラーメッセージを出力

### 4. バックアップ機能

- 取り込み前に、現行DBの品物・準備情報を`data/bk_items.csv`にエクスポートします。
- フォーマットは`data/items.csv`と同一です。
- バックアップが正常に完了しない場合、インポート処理は実行されません。
- 切り戻しが必要な場合は`bk_items.csv`を使って復元できます。

---

## 注意点・運用ルール

- **CSVのカラム名・順序はスクリプトと一致させること**
- **場所名・区分値はDB/enum定義と完全一致させること**（誤字・余計な空白に注意）
- 既存品物はitem_nameで照合し、重複登録を防止
- 失敗行はスキップされるため、エラー内容を必ず確認
- 本番DBに対して実行する場合は、事前にバックアップを取得

---

## 関連ファイル

- `scripts/import-items.ts` … 本体スクリプト
- `data/items.csv` … 入力データ
- `lib/schemas/enums/preparation-pattern.ts` … 区分値定義
- `lib/utils/enum-utils.ts` … 区分値変換ユーティリティ

---

## 参考

- 詳細な仕様・運用ルールは `/docs/アプリケーション概念設計ノート.md` も参照
- 問題・要望は開発チームまで
