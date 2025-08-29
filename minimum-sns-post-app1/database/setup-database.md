# データベースセットアップガイド

minimum-sns-post-app1用のPostgreSQLデータベースをコマンドラインから設定する手順です。

## 前提条件

- PostgreSQLがインストールされていること
- `psql`コマンドが利用可能であること
- PostgreSQLサービスが起動していること

## セットアップ手順

### 1. PostgreSQLサービスの確認・起動

#### Windows
```cmd
# サービス状態確認
sc query postgresql-x64-14

# サービス起動（管理者権限で実行）
net start postgresql-x64-14
```

#### macOS (Homebrew)
```bash
# サービス状態確認
brew services list | grep postgresql

# サービス起動
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
# サービス状態確認
sudo systemctl status postgresql

# サービス起動
sudo systemctl start postgresql
```

### 2. データベース作成

PostgreSQLに接続してデータベースを作成します：

```bash
# PostgreSQLに接続（デフォルトユーザーで接続）
psql -U postgres -h localhost

# または、パスワード付きで接続
psql -U postgres -h localhost -W
```

PostgreSQLプロンプトで以下のコマンドを実行：

```sql
-- データベース一覧確認
\l

-- minimum_sns_post_app1データベース作成（UTF8エンコーディング明示）
CREATE DATABASE minimum_sns_post_app1 
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TEMPLATE = template0;

-- データベース作成確認
\l minimum_sns_post_app1

-- 作成したデータベースに接続
\c minimum_sns_post_app1

-- 接続確認
SELECT current_database();
```

### 3. テーブル作成

データベースに接続した状態で、スキーマファイルを実行：

#### 方法1: psqlプロンプト内でファイル実行
```sql
-- スキーマファイルを実行
\i /path/to/minimum-sns-post-app1/database/schema.sql

-- または相対パスで（psqlを実行したディレクトリから）
\i database/schema.sql
```

#### 方法2: コマンドラインから直接実行
```bash
# プロジェクトルートディレクトリで実行
psql -U postgres -h localhost -d minimum_sns_post_app1 -f database/schema.sql
```

### 4. セットアップ確認

```sql
-- テーブル一覧確認
\dt

-- postsテーブルの構造確認
\d posts

-- サンプルデータ確認
SELECT * FROM posts ORDER BY created_at DESC;

-- 件数確認
SELECT COUNT(*) FROM posts;
```

## ワンライナーセットアップ

すべての手順を一度に実行する場合：

### UTF-8エンコーディング対応版
```bash
# PowerShellでUTF-8環境を設定
chcp 65001
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# UTF8データベース作成からテーブル作成まで一括実行
psql -U postgres -h localhost -c "CREATE DATABASE minimum_sns_post_app1 WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;" && \
psql -U postgres -h localhost -d minimum_sns_post_app1 --set client_encoding=UTF8 -f database/schema.sql
```

## トラブルシューティング

### よくあるエラーと対処法

#### 1. `psql: command not found`
PostgreSQLのbinディレクトリがPATHに含まれていない可能性があります。

**Windows:**
```cmd
# PATHに追加（例：PostgreSQL 14の場合）
set PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin
```

**macOS/Linux:**
```bash
# .bashrcまたは.zshrcに追加
export PATH="/usr/local/pgsql/bin:$PATH"
```

#### 2. `psql: FATAL: password authentication failed`
パスワードが間違っているか、認証方法を確認してください。

```bash
# パスワード付きで接続
psql -U postgres -h localhost -W

# または、環境変数で設定
export PGPASSWORD=your_password
psql -U postgres -h localhost
```

#### 3. `psql: FATAL: database "minimum_sns_post_app1" does not exist`
データベースが作成されていません。手順2を確認してください。

#### 4. `ERROR: database "minimum_sns_post_app1" already exists`
既にデータベースが存在します。削除して再作成する場合：

```sql
-- 既存データベース削除（注意：データが消失します）
DROP DATABASE IF EXISTS minimum_sns_post_app1;

-- 再作成
CREATE DATABASE minimum_sns_post_app1;
```

### 接続テスト

セットアップが完了したら、アプリケーションからの接続をテスト：

```bash
# 接続テスト
psql -U postgres -h localhost -d minimum_sns_post_app1 -c "SELECT 'Connection successful!' as status;"
```

## 環境別設定

### 開発環境
- データベース名: `minimum_sns_post_app1`
- ポート: `5432`
- ユーザー: `postgres`

### テスト環境（将来の拡張用）
- データベース名: `minimum_sns_post_app1_test`
- ポート: `5432`
- ユーザー: `postgres`

### 本番環境（将来の拡張用）
- データベース名: `minimum_sns_post_app1_prod`
- ポート: `5432`
- ユーザー: 専用ユーザーを作成推奨

## 次回以降のアプリ作成時の注意点

同様のアプリを作成する際は、以下の命名規則に従ってください：

- リポジトリ名: `minimum-sns-post-app2`, `minimum-sns-post-app3`, ...
- データベース名: `minimum_sns_post_app2`, `minimum_sns_post_app3`, ...
- アプリケーション名: `Minimum SNS Post App2`, `Minimum SNS Post App3`, ...

これにより、複数のアプリが同じ環境で競合することを防げます。
