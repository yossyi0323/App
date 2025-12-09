# Minimum SNS Post App 2 (Rust Edition)

RustでフルスタックWebアプリケーション開発を学ぶためのシンプルな匿名投稿アプリケーション。

## 技術スタック

### バックエンド
- **言語**: Rust 1.75+
- **Webフレームワーク**: Axum 0.7
- **データベース**: PostgreSQL 14+
- **非同期ランタイム**: tokio
- **データベースクライアント**: sqlx
- **シリアライゼーション**: serde + serde_json
- **エラーハンドリング**: anyhow + thiserror

### フロントエンド
- **フレームワーク**: Leptos 0.6
- **HTTPクライアント**: gloo-net
- **ビルドツール**: trunk

## 機能

- 匿名での投稿作成（認証不要）
- 投稿一覧表示（新しい順）
- 投稿の編集
- 投稿の削除
- UUIDv7による投稿ID管理

## 前提条件

### 必須
- Rust 1.75以上（[rustup](https://rustup.rs/)でインストール）
- PostgreSQL 14以上
- Node.js 18以上（trunk用）

### インストールが必要なツール

```bash
# Rustターゲット追加（WebAssembly用）
rustup target add wasm32-unknown-unknown

# trunkインストール（フロントエンドビルドツール）
cargo install trunk

# wasm-bindgen-cliインストール
cargo install wasm-bindgen-cli

# sqlx-cliインストール（データベースマイグレーション用、オプション）
cargo install sqlx-cli --no-default-features --features postgres
```

## セットアップ

### 1. リポジトリのクローン

```bash
cd minimum-sns-post-app2
```

### 2. データベースセットアップ

詳細は [`database/setup-database.md`](database/setup-database.md) を参照。

#### クイックセットアップ

```bash
# PostgreSQLに接続
psql -U postgres

# データベースとユーザー作成
CREATE DATABASE minimum_sns_post_app2;
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE minimum_sns_post_app2 TO app_user;

# データベースに接続して権限設定
\c minimum_sns_post_app2
GRANT ALL ON SCHEMA public TO app_user;
\q

# スキーマ適用
psql -U postgres -d minimum_sns_post_app2 -f database/schema.sql

# テーブル権限付与（重要）
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

### 3. バックエンド環境変数設定

`server/.env`ファイルを作成：

```bash
cd server
cp .env.example .env
```

`.env`の内容を必要に応じて編集：

```env
DATABASE_URL=postgres://app_user:app_password@localhost/minimum_sns_post_app2
SERVER_PORT=8080
```

## 開発サーバーの起動

### バックエンドサーバー起動

```bash
cd server
cargo run
```

サーバーは `http://localhost:8080` で起動します。

### フロントエンド開発サーバー起動（別ターミナル）

```bash
cd front
trunk serve --open
```

フロントエンドは `http://localhost:8081` で起動します（trunk devサーバー）。

## プロダクションビルド

### バックエンド

```bash
cd server
cargo build --release
```

実行ファイルは `server/target/release/minimum-sns-post-app2-server` に生成されます。

### フロントエンド

```bash
cd front
trunk build --release
```

ビルド成果物は `front/dist/` に生成されます。

## テストの実行

### バックエンドテスト

バックエンドサーバーが起動している状態で実行：

```bash
cd server

# 全テスト実行
cargo test

# 特定のテスト実行
cargo test test_create_post_success

# 詳細出力
cargo test -- --nocapture
```

#### テスト観点

- **POST /api/posts**: 正常系（作成成功、ID/日時設定確認）、異常系（空content）
- **GET /api/posts**: 正常系（全件取得、新しい順ソート、0件時の空配列）
- **GET /api/posts/:id**: 正常系（単件取得）、異常系（存在しないID）
- **PUT /api/posts/:id**: 正常系（更新成功、updated_at更新、created_at不変）、異常系（空content、存在しないID）
- **DELETE /api/posts/:id**: 正常系（削除成功、削除後の取得失敗確認）、異常系（存在しないID、二重削除）

全15テストケース実装済み。

### フロントエンドテスト

```bash
cd front

# WebAssemblyテスト実行
wasm-pack test --headless --firefox
```

**注意**: Leptosのコンポーネントテストは複雑なセットアップが必要なため、基本的なレンダリングテストのみ実装。
本格的なテストはE2Eテストツール（Playwright等）の使用を推奨。

## プロジェクト構造

```
minimum-sns-post-app2/
├── server/                 # バックエンド（Axum）
│   ├── src/
│   │   ├── main.rs        # エントリーポイント、ルーティング
│   │   ├── db.rs          # データベース接続
│   │   ├── errors.rs      # エラー型定義（thiserror）
│   │   ├── handlers/      # HTTPハンドラー層
│   │   │   └── posts.rs   # 投稿関連エンドポイント
│   │   ├── models/        # データモデル
│   │   │   └── post.rs    # Post構造体、リクエスト型
│   │   └── repositories/  # データアクセス層
│   │       └── posts.rs   # 投稿CRUD操作
│   ├── tests/
│   │   └── api_tests.rs   # API統合テスト
│   ├── Cargo.toml
│   └── .env.example
├── front/                  # フロントエンド（Leptos）
│   ├── src/
│   │   ├── lib.rs         # メインコンポーネント
│   │   └── main.rs        # エントリーポイント
│   ├── tests/
│   │   └── component_tests.rs
│   ├── index.html         # HTMLテンプレート + CSS
│   ├── Cargo.toml
│   └── Trunk.toml
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
  "content": "Hello, Rust!"
}
```

レスポンス（201 Created）：
```json
{
  "id": "01932e7f-8b2a-7890-a123-456789abcdef",
  "content": "Hello, Rust!",
  "created_at": "2024-11-03T10:30:00Z",
  "updated_at": "2024-11-03T10:30:00Z"
}
```

#### GET /api/posts

レスポンス（200 OK）：
```json
[
  {
    "id": "01932e7f-8b2a-7890-a123-456789abcdef",
    "content": "Hello, Rust!",
    "created_at": "2024-11-03T10:30:00Z",
    "updated_at": "2024-11-03T10:30:00Z"
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

### 権限エラー

```
permission denied for table posts
```

対処：
```bash
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;"
psql -U postgres -d minimum_sns_post_app2 -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;"
```

### ポート競合エラー

```
Address already in use
```

対処：
- `.env`のSERVER_PORTを変更（例：8081）
- 既存のプロセスを終了

### フロントエンドビルドエラー

```
wasm-bindgen: command not found
```

対処：
```bash
cargo install wasm-bindgen-cli
```

### テスト失敗

バックエンドサーバーが起動していることを確認してください。

```bash
# ターミナル1
cd server
cargo run

# ターミナル2
cd server
cargo test
```

## 学習ポイント

### Rustバックエンド開発
- Axumによる型安全なルーティング
- sqlxによるコンパイル時SQL検証
- anyhow/thiserrorによるエラーハンドリング
- tokioによる非同期処理

### Rustフロントエンド開発
- LeptosによるReactiveなUI構築
- WebAssembly（WASM）へのコンパイル
- gloo-netによるHTTP通信

### アーキテクチャ
- レイヤードアーキテクチャ（Handler → Repository → Database）
- JSON APIの設計とステータスコード
- CORS設定
- エラーレスポンスの統一

## 参考リソース

- [Axum Documentation](https://docs.rs/axum/latest/axum/)
- [Leptos Book](https://leptos-rs.github.io/leptos/)
- [sqlx Documentation](https://docs.rs/sqlx/latest/sqlx/)
- [Rust Async Book](https://rust-lang.github.io/async-book/)

## ライセンス

MIT

