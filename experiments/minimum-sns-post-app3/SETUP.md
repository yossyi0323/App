# セットアップガイド

このガイドでは、Minimum SNS Post App3をローカル環境でセットアップする方法を説明します。

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Go 1.21以上**: [公式サイト](https://golang.org/dl/)からインストール
- **PostgreSQL 14以上**: [公式サイト](https://www.postgresql.org/download/)からインストール
- **ブラウザ**: モダンブラウザ（Chrome、Firefox、Edgeなど）

## セットアップ手順

### 1. Goのインストール確認

```bash
go version
```

Go 1.21以上がインストールされていることを確認してください。

### 2. PostgreSQLのインストール確認

```bash
psql --version
```

PostgreSQL 14以上がインストールされていることを確認してください。

### 3. データベースセットアップ

詳細は [`database/setup-database.md`](database/setup-database.md) を参照してください。

#### クイックセットアップ

```bash
# PostgreSQLに接続
psql -U postgres

# データベースとユーザー作成
CREATE DATABASE minimum_sns_post_app3;
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE minimum_sns_post_app3 TO app_user;

# データベースに接続して権限設定
\c minimum_sns_post_app3
GRANT ALL ON SCHEMA public TO app_user;
\q

# スキーマ適用
psql -U postgres -d minimum_sns_post_app3 -f database/schema.sql

# テーブル権限付与（重要）
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

### 4. バックエンド環境変数設定

`server/.env`ファイルを作成します：

```bash
cd server
```

`.env`ファイルを作成し、以下を記述：

```env
# PostgreSQL接続URL（ローカル開発環境ではSSLを無効化）
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable

# バックエンドアプリケーション（Goサーバー）のポート
SERVER_PORT=8080
```

**注意**: データベースのパスワードやポートは、実際の環境に合わせて変更してください。

### 5. バックエンド依存関係インストール

```bash
go mod tidy
```

**注意**: `go mod tidy`は依存関係を整理し、`go.sum`ファイルを生成します（npmの`npm install`やMavenの`mvn install`に相当）。実際には`go run`や`go build`を実行すると自動的に依存関係がダウンロードされますが、明示的に実行することもできます。

### 6. バックエンドサーバー起動

```bash
go run main.go
```

サーバーが起動すると、以下のメッセージが表示されます：

```
Server starting on :8080
```

### 7. フロントエンド開発サーバー起動（別ターミナル）

#### 方法1: Python HTTPサーバー

```bash
cd front
python -m http.server 8081
```

#### 方法2: Node.js HTTPサーバー

```bash
cd front
npx http-server -p 8081
```

#### 方法3: Go HTTPサーバー

```bash
cd front
go run -m http.server 8081
```

フロントエンドは `http://localhost:8081` で起動します。

### 8. ブラウザで確認

ブラウザで `http://localhost:8081` にアクセスし、アプリケーションが正常に動作することを確認してください。

## トラブルシューティング

### Goがインストールされていない

```
go: command not found
```

**対処**: [Go公式サイト](https://golang.org/dl/)からGoをインストールしてください。

### PostgreSQLがインストールされていない

```
psql: command not found
```

**対処**: [PostgreSQL公式サイト](https://www.postgresql.org/download/)からPostgreSQLをインストールしてください。

### データベース接続エラー

```
Failed to connect to database
```

**対処**:
1. PostgreSQLサービスが起動しているか確認
2. `.env`ファイルのDATABASE_URLが正しいか確認
3. データベースとユーザーが作成されているか確認

### SSLエラー

```
pq: SSL is not enabled on the server
```

**対処**: `.env`ファイルのDATABASE_URLに`?sslmode=disable`を追加してください：

```env
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable
```

**補足**: これはGo言語固有の問題ではなく、PostgreSQLドライバ（lib/pq）がデフォルトでSSL接続を試みるためです。ローカル開発環境では通常SSLが設定されていないため、`sslmode=disable`を指定します。本番環境ではSSLを有効にすることを推奨します。

### ポートが既に使用されている

```
Address already in use
```

**対処**:
- `.env`ファイルのSERVER_PORTを変更（例：8081）
- 既存のプロセスを終了

### CORSエラー

フロントエンドからAPIにアクセスできない場合、ブラウザのコンソールでCORSエラーが表示される可能性があります。

**対処**:
- フロントエンドをHTTPサーバー経由で開く（直接ファイルを開かない）
- バックエンドのCORS設定を確認

## 次のステップ

セットアップが完了したら、以下を試してみてください：

1. 投稿を作成する
2. 投稿一覧を確認する
3. 投稿を編集する
4. 投稿を削除する
5. テストを実行する（`go test ./...`）

詳細は [README.md](README.md) を参照してください。


