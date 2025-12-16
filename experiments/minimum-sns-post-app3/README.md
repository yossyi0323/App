# Minimum SNS Post App3 (Go Edition)

GoでフルスタックWebアプリケーション開発を学ぶためのシンプルな匿名投稿アプリケーション。

## 技術スタック

### バックエンド
- **言語**: Go 1.21+
- **Webフレームワーク**: Gin
- **データベース**: PostgreSQL 14+
- **データベースドライバ**: lib/pq
- **UUID**: google/uuid
- **環境変数**: joho/godotenv

### フロントエンド
- **フレームワーク**: Vanilla JavaScript
- **HTTPクライアント**: Fetch API
- **ビルドツール**: 不要（静的HTML/CSS/JS）

## 機能

- 匿名での投稿作成（認証不要）
- 投稿一覧表示（新しい順）
- 投稿の編集
- 投稿の削除
- UUIDによる投稿ID管理

## 前提条件

### 必須
- Go 1.21以上（[公式サイト](https://golang.org/dl/)からインストール）
- PostgreSQL 14以上
- ブラウザ（モダンブラウザ）

## セットアップ

### 1. リポジトリのクローン

```bash
cd minimum-sns-post-app3
```

### 2. データベースセットアップ

詳細は [`database/setup-database.md`](database/setup-database.md) を参照。

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

### 3. バックエンド環境変数設定

`server/.env`ファイルを作成：

```bash
cd server
cp .env.example .env
```

`.env`の内容を必要に応じて編集：

```env
# PostgreSQL接続URL（ローカル開発環境ではSSLを無効化）
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable

# バックエンドアプリケーション（Goサーバー）のポート
SERVER_PORT=8080
```

### 4. バックエンド依存関係インストール

```bash
cd server
go mod tidy
```

**注意**: `go mod tidy`は依存関係を整理し、`go.sum`ファイルを生成します（npmの`npm install`やMavenの`mvn install`に相当）。実際には`go run`や`go build`を実行すると自動的に依存関係がダウンロードされますが、明示的に実行することもできます。

## 開発サーバーの起動

### バックエンドサーバー起動

```bash
cd server
go run main.go
```

サーバーは `http://localhost:8080` で起動します。

### フロントエンド開発サーバー起動

フロントエンドは静的ファイルなので、以下のいずれかの方法で起動できます：

#### 方法1: 簡易HTTPサーバー（Python）

```bash
cd front
python -m http.server 8081
```

#### 方法2: 簡易HTTPサーバー（Node.js）

```bash
cd front
npx http-server -p 8081
```

#### 方法3: ブラウザで直接開く

`front/index.html` をブラウザで直接開くこともできますが、CORSの問題が発生する可能性があります。

フロントエンドは `http://localhost:8081` で起動します。

## プロダクションビルド

### バックエンド

```bash
cd server
go build -o minimum-sns-post-app3-server
```

実行ファイルは `server/minimum-sns-post-app3-server` に生成されます。

実行：

```bash
./minimum-sns-post-app3-server
```

### フロントエンド

フロントエンドは静的ファイルなので、そのままデプロイできます。`front/`ディレクトリの内容をWebサーバーにアップロードしてください。

## テストの実行

### バックエンドテスト

```bash
cd server

# 全テスト実行
go test ./...

# 特定のテスト実行
go test ./tests -v

# カバレッジレポート
go test ./... -cover
```

**注意**: テストを実行すると、`TearDownSuite()`でデータベースの全投稿が削除されます。開発用データを保護するには、テスト用の別データベースを使用することを推奨します。

テスト用データベースを使用する場合：

```bash
# テスト用データベースを作成（初回のみ）
psql -U postgres -c "CREATE DATABASE minimum_sns_post_app3_test;"

# .envファイルに追加
# TEST_DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3_test?sslmode=disable
```

#### テスト観点

- **POST /api/posts**: 正常系（作成成功、ID/日時設定確認）、異常系（空content）
- **GET /api/posts**: 正常系（全件取得、新しい順ソート、0件時の空配列）
- **GET /api/posts/:id**: 正常系（単件取得）、異常系（存在しないID）
- **PUT /api/posts/:id**: 正常系（更新成功、updated_at更新、created_at不変）、異常系（空content、存在しないID）
- **DELETE /api/posts/:id**: 正常系（削除成功、削除後の取得失敗確認）、異常系（存在しないID、二重削除）

### フロントエンドテスト

Vanilla JavaScriptのテストは、JestやMochaなどのテストフレームワークを使用できますが、このプロジェクトでは簡易的なテストを実装しています。

```bash
cd front

# テストファイルがある場合
npm test  # または適切なテストコマンド
```

**注意**: フロントエンドテストのセットアップは、必要に応じて追加してください。

## プロジェクト構造

```
minimum-sns-post-app3/
├── server/                 # バックエンド（Go + Gin）
│   ├── main.go            # エントリーポイント、ルーティング
│   ├── db/                # データベース接続
│   │   └── db.go
│   ├── models/            # データモデル
│   │   └── post.go
│   ├── handlers/          # HTTPハンドラー層
│   │   ├── post_handler.go
│   │   └── post_handler_test.go
│   ├── repository/        # データアクセス層
│   │   └── post_repository.go
│   ├── tests/             # 統合テスト
│   │   └── api_test.go
│   ├── go.mod
│   ├── go.sum
│   └── .env.example
├── front/                  # フロントエンド（Vanilla JavaScript）
│   ├── index.html         # HTMLテンプレート
│   ├── app.js             # メインJavaScript
│   └── styles.css         # CSS
├── database/              # データベース関連
│   ├── schema.sql         # テーブル定義
│   └── setup-database.md  # セットアップ手順
└── README.md
```

## API仕様

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/posts` | 投稿作成 |
| GET | `/api/posts` | 投稿一覧取得 |
| GET | `/api/posts/:id` | 投稿詳細取得 |
| PUT | `/api/posts/:id` | 投稿更新 |
| DELETE | `/api/posts/:id` | 投稿削除 |

### レスポンス例

#### POST /api/posts

リクエスト：
```json
{
  "content": "Hello, Go!"
}
```

レスポンス（201 Created）：
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello, Go!",
  "createdAt": "2024-11-03T10:30:00Z",
  "updatedAt": "2024-11-03T10:30:00Z"
}
```

#### GET /api/posts

レスポンス（200 OK）：
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello, Go!",
    "createdAt": "2024-11-03T10:30:00Z",
    "updatedAt": "2024-11-03T10:30:00Z"
  }
]
```

## トラブルシューティング

### データベース接続エラー

```
Failed to connect to database
```

対処：
1. PostgreSQLが起動しているか確認
2. `.env`のDATABASE_URLが正しいか確認
3. データベースとユーザーが作成されているか確認

### SSLエラー

```
pq: SSL is not enabled on the server
```

対処：`.env`ファイルのDATABASE_URLに`?sslmode=disable`を追加してください：

```env
DATABASE_URL=postgres://app_user:app_password@localhost:5432/minimum_sns_post_app3?sslmode=disable
```

**補足**: これはGo言語固有の問題ではなく、PostgreSQLドライバ（lib/pq）がデフォルトでSSL接続を試みるためです。ローカル開発環境では通常SSLが設定されていないため、`sslmode=disable`を指定します。本番環境ではSSLを有効にすることを推奨します。

### 権限エラー

```
permission denied for table posts
```

対処：
```bash
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app3 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

### ポート競合エラー

```
Address already in use
```

対処：
- `.env`のSERVER_PORTを変更（例：8081）
- 既存のプロセスを終了

### CORSエラー

フロントエンドからAPIにアクセスできない場合、ブラウザのコンソールでCORSエラーが表示される可能性があります。

対処：
- バックエンドのCORS設定を確認（`main.go`）
- フロントエンドをHTTPサーバー経由で開く（直接ファイルを開かない）

### テスト失敗

バックエンドテストを実行する前に、データベースが起動し、`.env`ファイルが正しく設定されていることを確認してください。

```bash
# データベース接続確認
psql -U app_user -d minimum_sns_post_app3

# .envファイル確認
cd server
cat .env
```

## 学習ポイント

### Goバックエンド開発
- GinによるRESTful API構築
- lib/pqによるPostgreSQL接続
- レイヤードアーキテクチャ（Handler → Repository → Database）
- エラーハンドリング
- テストの書き方（testify使用）

### フロントエンド開発
- Vanilla JavaScriptによるSPA風の実装
- Fetch APIによるHTTP通信
- DOM操作とイベントハンドリング
- 状態管理（シンプルな実装）

### アーキテクチャ
- レイヤードアーキテクチャ
- JSON APIの設計とステータスコード
- CORS設定
- エラーレスポンスの統一

## 参考リソース

- [Go Documentation](https://go.dev/doc/)
- [Gin Documentation](https://gin-gonic.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)（JavaScript/Fetch API）

## ライセンス

MIT


