# moc-app2

営業準備業務モックアプリケーション（技術スタック更新版）

## 技術スタック

### バックエンド
- Spring Boot 3.2+
- UroboroSQL 1.6+（SQL実行フレームワーク）
- PostgreSQL
- Springdoc OpenAPI（Swagger UI）

### フロントエンド
- Vue3 + Vite
- Pinia（状態管理）
- Vue Router
- shadcn-vue + Tailwind CSS
- Zod（ランタイムバリデーション）
- VeeValidate（フォーム管理）
- @tools/auto-save（自動保存）
- VueUse（Composables）
- Axios（HTTPクライアント）
- date-fns（日付処理）
- Playwright（E2Eテスト）
- Vitest（単体テスト）

### 開発ツール
- TypeScript
- ESLint + Prettier
- A5:SQL Mk-2（ER図生成）

## ディレクトリ構造

```
moc-app2/
├── backend/          # Spring Boot + UroboroSQL
├── frontend/         # Vue3 + Vite + shadcn-vue
├── database/         # データベーススキーマ（moc-appと同じ）
└── README.md
```

## データベースセットアップ

### PostgreSQLデータベースの作成

#### 方法1: スクリプトを使用（推奨）

**Windows:**
```powershell
cd scripts
powershell -ExecutionPolicy Bypass -File create-database.ps1
```

**Linux/Mac:**
```bash
cd scripts
chmod +x create-database.sh
./create-database.sh
```

#### 方法2: 手動で作成

```sql
-- データベースを作成
CREATE DATABASE operations_prepare_moc2;

-- データベースに接続してスキーマを適用
\c operations_prepare_moc2
\i database/schema.sql
```

または、psqlコマンドで実行：

```bash
psql -U postgres -f database/schema.sql operations_prepare_moc2
```

## 起動方法

### バックエンド

1. データベース接続情報を確認・設定（`backend/src/main/resources/application.yml`）
2. Maven Wrapperを使用して起動：

```bash
cd backend
./mvnw spring-boot:run
```

または、Mavenがインストールされている場合：

```bash
cd backend
mvn spring-boot:run
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## テスト実行

### バックエンドテスト

```bash
cd backend
./mvnw test
```

または：

```bash
cd backend
mvn test
```

### フロントエンドテスト

#### 単体テスト
```bash
cd frontend
npm test
```

#### E2Eテスト
```bash
cd frontend
npm run test:e2e
```

#### 全テスト実行
```bash
cd frontend
npm test && npm run test:e2e
```

## データベーススキーマ

moc-appと同じスキーマを使用（`database/schema.sql`）

ただし、楽観ロック対応のため、`inventory_status`テーブルに`version`列を追加：

```sql
version INTEGER DEFAULT 0 NOT NULL
```

## シードデータの投入

開発用のシードデータを投入するには、`setup`フォルダのスクリプトを使用してください：

**PowerShell:**
```powershell
cd setup
.\seed.ps1
```

**Bash:**
```bash
cd setup
chmod +x seed.sh
./seed.sh
```

**注意:** 
- シードファイル (`setup/seed.sql`) はUTF-8エンコーディングで保存されています
- 既存のデータは削除されません。新しいデータを投入する前に、必要に応じて既存データを削除してください

