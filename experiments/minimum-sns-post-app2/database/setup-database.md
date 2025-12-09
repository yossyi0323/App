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
CREATE DATABASE minimum_sns_post_app2;

# ユーザー作成（開発用）
CREATE USER app_user WITH PASSWORD 'app_password';

# 権限付与
GRANT ALL PRIVILEGES ON DATABASE minimum_sns_post_app2 TO app_user;

# 接続して追加の権限設定
\c minimum_sns_post_app2
GRANT ALL ON SCHEMA public TO app_user;
```

### 2. スキーマ適用

```bash
# データベースディレクトリに移動
cd database

# スキーマを適用
psql -U postgres -d minimum_sns_post_app2 -f schema.sql
```

### 3. テーブル権限付与（重要）

スキーマ適用後、app_userがテーブルにアクセスできるように権限を付与します：

```bash
# PowerShellの場合
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

または、PostgreSQLに接続して実行：

```sql
psql -U postgres -d minimum_sns_post_app2

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
psql -U app_user -d minimum_sns_post_app2

# テーブル確認
\dt

# スキーマ確認
\d posts
```

## 環境変数設定

`server/.env`ファイルを作成：

```env
DATABASE_URL=postgres://app_user:app_password@localhost/minimum_sns_post_app2
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
\c minimum_sns_post_app2 postgres
GRANT ALL ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
```




