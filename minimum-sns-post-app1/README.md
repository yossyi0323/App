# Minimum SNS Post App1

誰でも匿名でテキストを投稿・閲覧できるシンプルなWebアプリケーションです。

## 技術スタック

### フロントエンド
- **Vue.js 2.6.14** (Options API)
- **Axios** (HTTP通信)
- **Vue CLI** (開発環境)
- **Nginx** (本番配信)

### バックエンド
- **Java 17**
- **Spring Boot 2.7.14**
- **Spring Data JPA**
- **Maven** (ビルドツール)

### データベース
- **PostgreSQL**

### インフラ・デプロイ
- **Docker & Docker Compose**
- **WSL2** (Windows環境)
- **Multi-stage Docker builds**

## プロジェクト構造

```
minimum-sns-post-app1/
├── front/              # Vue.js フロントエンド
│   ├── src/
│   │   ├── components/ # Vueコンポーネント
│   │   ├── services/   # API通信サービス
│   │   ├── App.vue     # メインコンポーネント
│   │   └── main.js     # エントリーポイント
│   ├── public/         # 静的ファイル
│   ├── package.json    # npm設定
│   └── vue.config.js   # Vue CLI設定
├── server/             # Spring Boot バックエンド
│   ├── src/
│   │   ├── main/java/com/example/anonymousmemo/
│   │   │   ├── controller/    # REST APIコントローラー
│   │   │   ├── service/       # ビジネスロジック
│   │   │   ├── repository/    # データアクセス層
│   │   │   ├── entity/        # JPA エンティティ
│   │   │   ├── dto/           # データ転送オブジェクト
│   │   │   └── exception/     # 例外ハンドリング
│   │   └── resources/
│   │       └── application.yml # 設定ファイル
│   └── pom.xml         # Maven設定
├── database/           # データベーススキーマ
│   └── schema.sql      # テーブル定義
└── README.md           # このファイル
```

## セットアップ方法

### Docker環境での立ち上げ（推奨）

WSL2 + Docker環境での簡単セットアップ方法です。

#### 1. 前提条件
- **Windows 11/10** with WSL2
- **Docker Desktop** または **Docker Engine in WSL2**
- **Git**

#### 2. リポジトリクローン
```bash
# WSL2環境で実行
git clone https://gitlab.com/yossyi0323/app.git
cd app/minimum-sns-post-app1
```

#### 3. Docker環境での起動
```bash
# 全サービス（PostgreSQL、Backend、Frontend）を一括起動
docker-compose up -d --build

# 起動状況確認
docker-compose ps

# ログ確認（問題がある場合）
docker-compose logs -f
```

#### 4. アプリケーションアクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080/api/posts
- **ヘルスチェック**: http://localhost:8080/api/posts/health

#### 5. 停止方法
```bash
# アプリケーション停止
docker-compose down

# WSL2から出る
exit

# WSL2完全停止（PowerShellで）
wsl --shutdown
```

#### Docker構成
- **PostgreSQL**: ポート5432（データベース）
- **Spring Boot**: ポート8080（バックエンドAPI）
- **Vue.js + Nginx**: ポート3000（フロントエンド）

---

### 従来の開発環境セットアップ

#### 1. 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- **Java 11以上**
- **Node.js 16以上**
- **PostgreSQL 12以上**
- **Maven 3.6以上**

### 2. データベースセットアップ

PostgreSQLにデータベースを作成します：

#### 基本セットアップ
```bash
# データベース作成
psql -U postgres -h localhost -c "CREATE DATABASE minimum_sns_post_app1;"

# テーブル作成
psql -U postgres -h localhost -d minimum_sns_post_app1 -f database/schema.sql
```

#### 詳細な手順
詳しいセットアップ手順は [`database/setup-database.md`](database/setup-database.md) を参照してください。

#### ワンライナーセットアップ
```bash
# 一括セットアップ
psql -U postgres -h localhost -c "CREATE DATABASE minimum_sns_post_app1;" && \
psql -U postgres -h localhost -d minimum_sns_post_app1 -f database/schema.sql
```

### 3. バックエンドセットアップ

```bash
# serverディレクトリに移動
cd server

# 依存関係インストール
mvn clean install

# アプリケーション起動（ポート8080）
mvn spring-boot:run
```

**環境変数設定（必要に応じて）：**
```bash
# データベースパスワードを設定
export DB_PASSWORD=your_password
```

### 4. フロントエンドセットアップ

```bash
# frontディレクトリに移動
cd front

# 依存関係インストール
npm install

# 開発サーバー起動（ポート8081）
npm run serve
```

### 5. アプリケーションアクセス

- **フロントエンド**: http://localhost:8081
- **バックエンドAPI**: http://localhost:8080/api/posts
- **ヘルスチェック**: http://localhost:8080/api/posts/health

## プロジェクト命名規則

このプロジェクトは連番管理されています：

- **リポジトリ名**: `minimum-sns-post-app1`
- **データベース名**: `minimum_sns_post_app1`
- **アプリケーション名**: `Minimum SNS Post App1`

次回作成時は `app2`, `app3` として連番で管理してください。

## API仕様

### エンドポイント

#### 1. 投稿一覧取得
- **URL**: `GET /api/posts`
- **レスポンス**: 
```json
[
  {
    "id": 1,
    "content": "投稿内容",
    "createdAt": "2024-01-01 12:00:00"
  }
]
```

#### 2. 投稿作成
- **URL**: `POST /api/posts`
- **リクエスト**: 
```json
{
  "content": "投稿内容"
}
```
- **レスポンス**: 
```json
{
  "id": 1
}
```

#### 3. ヘルスチェック
- **URL**: `GET /api/posts/health`
- **レスポンス**: 
```json
{
  "status": "UP",
  "message": "Minimum SNS Post App1 API is running"
}
```

## 開発コマンド

### フロントエンド

```bash
# 開発サーバー起動
npm run serve

# プロダクションビルド
npm run build

# リント実行
npm run lint

# テスト実行
npm run test:unit
```

### バックエンド

```bash
# 開発サーバー起動
mvn spring-boot:run

# テスト実行
mvn test

# パッケージ作成
mvn package

# クリーンビルド
mvn clean install
```

## 機能説明

### フロントエンド機能
- 投稿フォーム（テキストエリア + 送信ボタン）
- 投稿一覧表示（新しい順）
- リアルタイム文字数カウント
- エラーハンドリング
- ローディング状態表示
- レスポンシブデザイン

### バックエンド機能
- REST API提供
- データベース連携
- バリデーション
- CORS設定
- エラーハンドリング
- ログ出力

### データベース機能
- 投稿データ永続化
- 自動タイムスタンプ
- インデックス最適化

## トラブルシューティング

### Docker環境での問題

1. **フロントエンドビルドエラー（npm ERESOLVE）**
   ```bash
   # 依存関係の競合エラーが発生した場合
   # package.jsonのバージョンを調整済み
   docker-compose down
   docker-compose up --build  # 再ビルドで解決
   ```

2. **バックエンドヘルスチェック失敗**
   ```bash
   # curlコマンドが見つからないエラー
   # Dockerfileでcurlをインストール済み
   docker-compose logs backend  # ログで確認
   ```

3. **WSL2でのDocker起動問題**
   ```bash
   # Docker Engineのインストール確認
   docker --version
   
   # サービス起動
   sudo service docker start
   ```

4. **メモリ不足**
   ```bash
   # WSL2のメモリ設定確認
   # .wslconfigでメモリ制限を調整
   ```

### 従来環境での問題

1. **データベース接続エラー**
   - PostgreSQLサービスが起動しているか確認
   - データベース名、ユーザー名、パスワードが正しいか確認

2. **CORS エラー**
   - バックエンドのCORS設定を確認
   - フロントエンドのプロキシ設定を確認

3. **ポート競合**
   - 8080, 8081ポートが使用されていないか確認
   - 必要に応じて設定ファイルでポート変更

### ログ確認

- **バックエンド**: コンソール出力またはログファイル
- **フロントエンド**: ブラウザの開発者ツール

## 今後の拡張案

- ユーザー認証機能
- 投稿編集・削除機能
- いいね機能
- 画像投稿機能
- 検索機能
- ページネーション
- CI/CD パイプライン
- Kubernetes対応
- 本番環境デプロイ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
