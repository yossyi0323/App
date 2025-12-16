# データベースセットアップ手順

## 前提条件

- PostgreSQL 14以上がインストールされていること
- `psql`コマンドが使用可能であること

## セットアップ手順

### 1. データベース作成

```bash
# PostgreSQLに接続（Windowsの場合）
psql -U postgres

# データベース作成
CREATE DATABASE minimum_sns_post_app3;

# ユーザー作成（開発用）
CREATE USER app_user WITH PASSWORD 'app_password';

# 権限付与
GRANT ALL PRIVILEGES ON DATABASE minimum_sns_post_app3 TO app_user;

# 接続して追加の権限設定
\c minimum_sns_post_app3
GRANT ALL ON SCHEMA public TO app_user;
```

### 2. スキーマ適用

```bash
# データベースディレクトリに移動
cd database

# スキーマを適用
psql -U postgres -d minimum_sns_post_app3 -f schema.sql
```

### 3. テーブル権限付与（重要）

スキーマ適用後、app_userがテーブルにアクセスできるように権限を付与します：

```bash
# PowerShellの場合
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

または、PostgreSQLに接続して実行：

```sql
psql -U postgres -d minimum_sns_post_app3

-- 以下のコマンドを実行
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
\q
```

**注意**: この手順を忘れると「permission denied for table posts」エラーが発生します。

### 4. 接続確認

```bash
# データベースに接続
psql -U app_user -d minimum_sns_post_app3

# テーブル確認
\dt

# スキーマ確認
\d posts
```

## 環境変数設定

`server/.env`ファイルを作成：

```env
# PostgreSQL接続URL（ローカル開発環境ではSSLを無効化）
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable

# バックエンドアプリケーション（Goサーバー）のポート
SERVER_PORT=8080
```

## トラブルシューティング

### 接続エラー

```
FATAL: password authentication failed for user "app_user"
```

対処：`pg_hba.conf`を確認し、必要に応じて認証方式を変更

### 権限エラー

```
ERROR: permission denied for schema public
```

対処：
```sql
\c minimum_sns_post_app3 postgres
GRANT ALL ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
```

### SSLエラー

アプリケーション実行時に以下のエラーが発生する場合：

```
pq: SSL is not enabled on the server
```

対処：`.env`ファイルのDATABASE_URLに`?sslmode=disable`を追加してください：

```env
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable
```

**補足**: これはGo言語固有の問題ではなく、PostgreSQLドライバ（lib/pq）がデフォルトでSSL接続を試みるためです。ローカル開発環境では通常SSLが設定されていないため、`sslmode=disable`を指定します。本番環境ではSSLを有効にすることを推奨します。

**注意**: 本番環境ではSSLを有効にすることを推奨しますが、ローカル開発環境では`sslmode=disable`を使用できます。


