# 🚀 **minimum-sns-post-app1 デプロイ手順書**

このガイドは、`minimum-sns-post-app1`を自宅サーバーにデプロイするための完全な手順書です。

## 📋 **前提条件**

- ✅ Linux環境（Ubuntu Server推奨）
- ✅ SSH接続が可能
- ✅ Docker & Docker Composeがインストール済み
- ✅ Git がインストール済み

## 🛠 **1. サーバー環境のセットアップ**

### **1.1 必要なソフトウェアのインストール**

```bash
# システムを最新に更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージをインストール
sudo apt install -y curl git

# Dockerをインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# 新しいグループ設定を反映（再ログインが必要）
newgrp docker
```

### **1.2 インストール確認**

```bash
# バージョン確認
docker --version
docker-compose --version
git --version
```

## 📦 **2. アプリケーションのデプロイ**

### **2.1 ソースコードの取得**

```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン（実際のリポジトリURLに置き換えてください）
git clone <your-repository-url>
cd minimum-sns-post-app1
```

### **2.2 環境設定ファイルの作成**

```bash
# プロダクション用の設定ファイルを作成
cat > server/src/main/resources/application-prod.yml << 'EOF'
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/minimum_sns_post_app1}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  sql:
    init:
      mode: never

server:
  port: 8080

logging:
  level:
    com.example.anonymousmemo: INFO
    org.springframework.web: INFO
EOF
```

### **2.3 コンテナのビルドと起動**

```bash
# すべてのコンテナをビルドして起動
docker-compose up -d --build

# 起動状況を確認
docker-compose ps

# ログを確認（問題がある場合）
docker-compose logs -f
```

### **2.4 動作確認**

```bash
# バックエンドのヘルスチェック
curl http://localhost:8080/api/posts/health

# 投稿一覧の取得（空の配列が返される）
curl http://localhost:8080/api/posts

# テスト投稿の作成
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content": "デプロイテスト投稿"}'
```

## 🌐 **3. 外部からのアクセス設定**

### **3.1 ファイアウォール設定**

```bash
# UFWを有効化（Ubuntu の場合）
sudo ufw enable

# 必要なポートを開放
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # フロントエンド
sudo ufw allow 8080/tcp  # バックエンド

# 設定確認
sudo ufw status
```

### **3.2 アクセス確認**

他のPCのブラウザから以下にアクセス：

- **フロントエンド**: `http://<サーバーのIPアドレス>:3000`
- **バックエンドAPI**: `http://<サーバーのIPアドレス>:8080/api/posts`

## 🔧 **4. 運用コマンド**

### **4.1 基本操作**

```bash
# アプリケーションを停止
docker-compose down

# アプリケーションを再起動
docker-compose restart

# ログを確認
docker-compose logs -f [サービス名]

# データベースに接続
docker-compose exec postgres psql -U postgres -d minimum_sns_post_app1
```

### **4.2 更新デプロイ**

```bash
# 最新のコードを取得
git pull origin main

# コンテナを再ビルドして起動
docker-compose up -d --build

# 古いイメージを削除（オプション）
docker image prune -f
```

### **4.3 データバックアップ**

```bash
# データベースをバックアップ
docker-compose exec postgres pg_dump -U postgres minimum_sns_post_app1 > backup_$(date +%Y%m%d_%H%M%S).sql

# データベースを復元
docker-compose exec -T postgres psql -U postgres minimum_sns_post_app1 < backup_file.sql
```

## 🛡 **5. セキュリティ設定**

### **5.1 基本的なセキュリティ対策**

```bash
# PostgreSQLのパスワードを変更
# docker-compose.ymlのPOSTGRES_PASSWORDを強力なパスワードに変更

# 不要なポートを閉じる
sudo ufw deny 5432/tcp  # PostgreSQLポートを外部から隠す
```

### **5.2 SSL/HTTPS設定（オプション）**

Nginx Proxy ManagerやCertbotを使用してHTTPS化することを推奨します。

## 🚨 **6. トラブルシューティング**

### **6.1 よくある問題**

**問題**: コンテナが起動しない
```bash
# 詳細なエラーログを確認
docker-compose logs [サービス名]

# コンテナの状態を確認
docker-compose ps -a
```

**問題**: データベース接続エラー
```bash
# PostgreSQLコンテナが正常に起動しているか確認
docker-compose exec postgres pg_isready -U postgres

# データベースに手動接続してみる
docker-compose exec postgres psql -U postgres -d minimum_sns_post_app1
```

**問題**: フロントエンドからバックエンドに接続できない
- nginx.confのproxy_pass設定を確認
- ネットワーク設定を確認
- CORSエラーの場合は、バックエンドのCORS設定を確認

### **6.2 完全リセット**

```bash
# すべてのコンテナとボリュームを削除
docker-compose down -v --remove-orphans

# 使用していないDockerリソースを削除
docker system prune -a --volumes

# 再度ビルドして起動
docker-compose up -d --build
```

## 📊 **7. 監視とメンテナンス**

### **7.1 ログ監視**

```bash
# リアルタイムログ監視
docker-compose logs -f --tail=100

# 特定のサービスのログ
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### **7.2 リソース監視**

```bash
# コンテナのリソース使用量
docker stats

# ディスク使用量
df -h
docker system df
```

## ✅ **8. デプロイ完了チェックリスト**

- [ ] Docker & Docker Compose がインストールされている
- [ ] ソースコードがクローンされている
- [ ] 環境設定ファイルが作成されている
- [ ] すべてのコンテナが正常に起動している
- [ ] ヘルスチェックが成功している
- [ ] 外部からフロントエンドにアクセスできる
- [ ] 投稿の作成・表示が正常に動作する
- [ ] ファイアウォール設定が適切に行われている
- [ ] バックアップ手順が確認されている

---

## 🎉 **デプロイ完了！**

これで`minimum-sns-post-app1`が自宅サーバーに正常にデプロイされました。

**アクセス先**:
- **アプリケーション**: http://<サーバーIP>:3000
- **API**: http://<サーバーIP>:8080/api/posts

何か問題が発生した場合は、トラブルシューティングセクションを参照してください。
