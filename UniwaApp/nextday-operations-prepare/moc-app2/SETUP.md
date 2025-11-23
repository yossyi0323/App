# moc-app2 セットアップガイド

## 前提条件

- Java 17以上
- Maven 3.9以上（またはMaven Wrapper）
- Node.js 18以上
- npm または yarn
- PostgreSQL 12以上

## データベースセットアップ

### 1. PostgreSQLデータベースの作成

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

```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE operations_prepare_moc2;

# データベースに接続してスキーマを適用
\c operations_prepare_moc2
\i database/schema.sql
```

または、psqlコマンドで実行：

```bash
psql -U postgres -f database/schema.sql operations_prepare_moc2
```

### 2. データベース接続情報の確認

`backend/src/main/resources/application.yml`の接続情報を確認：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/operations_prepare_moc2
    username: postgres
    password:  # 必要に応じて設定
```

## バックエンドセットアップ

### 1. 依存関係のインストール

```bash
cd backend
./mvnw install
```

または、Mavenがインストールされている場合：

```bash
cd backend
mvn install
```

### 2. テストの実行

```bash
cd backend
./mvnw test
```

### 3. アプリケーションの起動

```bash
cd backend
./mvnw spring-boot:run
```

アプリケーションは http://localhost:8080 で起動します。

Swagger UIは http://localhost:8080/swagger-ui.html で確認できます。

## フロントエンドセットアップ

### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

### 2. テストの実行

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

### 3. 開発サーバーの起動

```bash
cd frontend
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## トラブルシューティング

### バックエンド

#### データベース接続エラー
- PostgreSQLが起動しているか確認
- データベースが作成されているか確認
- 接続情報（username、password）を確認

#### UroboroSQLのエラー
- SQLファイルが`src/main/resources/sql`に配置されているか確認
- SQLファイルのパスが正しいか確認（`classpath:sql`）

### フロントエンド

#### 依存関係のインストールエラー
- Node.jsのバージョンを確認（18以上）
- `npm cache clean --force`を実行してから再インストール

#### テストの実行エラー
- Vitestの設定を確認
- Playwrightのブラウザをインストール: `npx playwright install`

