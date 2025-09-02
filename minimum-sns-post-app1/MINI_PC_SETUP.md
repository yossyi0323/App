# 🖥️ **ミニPC Docker デプロイ手順書**

このドキュメントは、ミニPCでDockerを使ってアプリケーションをデプロイするための手順書です。

## 📋 **前提条件**
- Windows 10/11 搭載のミニPC
- インターネット接続
- 管理者権限でのPowerShell実行可能

---

## 🚀 **Phase 1: WSL2とUbuntuのセットアップ**

### **1.1 WSL2を有効化**

```powershell
# PowerShellを管理者権限で開いて実行
wsl --install
```

**実行後**: 再起動が必要

### **1.2 Ubuntu初期設定**

再起動後、スタートメニューから「Ubuntu」を起動

```bash
# ユーザー名とパスワードを設定
# 例: ユーザー名 = server, パスワード = 任意

# システム更新
sudo apt update && sudo apt upgrade -y
```

---

## 🔐 **Phase 2: SSH接続環境の構築**

### **2.1 SSH サーバーセットアップ**

```bash
# OpenSSH サーバーをインストール
sudo apt install openssh-server -y

# SSH サービス開始・自動起動設定
sudo systemctl start ssh
sudo systemctl enable ssh

# 状態確認
sudo systemctl status ssh
```

### **2.2 IPアドレス確認**

```bash
# このミニPCのIPアドレスを確認（メモしておく）
ip addr show eth0 | grep inet
```

**出力例**: `inet 192.168.1.100/24` → **192.168.1.100** をメモ

### **2.3 SSH接続テスト**

```bash
# 自分自身にSSH接続してテスト
ssh server@localhost
# パスワード入力後にログインできればOK
```

---

## 🐳 **Phase 3: Docker環境のセットアップ**

### **3.1 Dockerをインストール**

```bash
# Dockerの公式スクリプトでインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# グループ設定を反映
newgrp docker

# Dockerバージョン確認
docker --version
```

### **3.2 Docker Composeをインストール**

```bash
# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 実行権限を付与
sudo chmod +x /usr/local/bin/docker-compose

# バージョン確認
docker-compose --version
```

### **3.3 Gitをインストール**

```bash
# Gitをインストール
sudo apt install git -y

# バージョン確認
git --version
```

---

## 📦 **Phase 4: アプリケーションのデプロイ**

### **4.1 アプリケーションをクローン**

```bash
# ホームディレクトリに移動
cd ~

# GitHubからクローン（実際のURLに置き換えてください）
git clone <your-repository-url>
cd minimum-sns-post-app1

# ファイル構成確認
ls -la
```

### **4.2 Docker環境で一括デプロイ**


```bash
# すべてのコンテナをビルドして起動
docker-compose up -d --build

# 起動状況確認
docker-compose ps

# ログ確認（全サービス）
docker-compose logs -f
```

### **4.3 動作確認**

```bash
# バックエンドのヘルスチェック
curl http://localhost:8080/api/posts/health

# 投稿一覧取得（空の配列が返される）
curl http://localhost:8080/api/posts

# テスト投稿を作成
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content": "Dockerデプロイテスト投稿"}'

# 投稿一覧を再取得（作成した投稿が表示される）
curl http://localhost:8080/api/posts
```

**ブラウザでアクセス**: 
- フロントエンド: `http://<ミニPCのIPアドレス>:3000`
- バックエンドAPI: `http://<ミニPCのIPアドレス>:8080/api/posts`

---

## 🔧 **Phase 5: 運用コマンド**

### **5.1 基本操作**

```bash
# コンテナを停止
docker-compose down

# コンテナを再起動
docker-compose restart

# 特定のサービスのログ確認
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# コンテナの状態確認
docker-compose ps
docker ps

# リソース使用量確認
docker stats
```

### **5.2 更新デプロイ**

```bash
# 最新のコードを取得
git pull origin main

# コンテナを再ビルドして起動
docker-compose up -d --build

# 古いイメージを削除（オプション）
docker image prune -f
```

### **5.3 データベース操作**

```bash
# PostgreSQLコンテナに接続
docker-compose exec postgres psql -U postgres -d minimum_sns_post_app1

# データベース内で実行可能なSQL例
# \dt          -- テーブル一覧
# SELECT * FROM posts;  -- 投稿データ確認
# \q           -- 終了
```

### **5.4 データバックアップ**

```bash
# データベースをバックアップ
docker-compose exec postgres pg_dump -U postgres minimum_sns_post_app1 > backup_$(date +%Y%m%d_%H%M%S).sql

# データベースを復元
docker-compose exec -T postgres psql -U postgres minimum_sns_post_app1 < backup_file.sql
```

---

## 🚨 **トラブルシューティング**

### **6.1 よくある問題**

**問題**: コンテナが起動しない
```bash
# 詳細なエラーログを確認
docker-compose logs [サービス名]

# コンテナの状態を確認
docker-compose ps -a
```

**問題**: ポートが使用中
```bash
# ポート使用状況を確認
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3000

# 使用中のプロセスを停止
sudo kill -9 <プロセスID>
```

**問題**: データベース接続エラー
```bash
# PostgreSQLコンテナが正常に起動しているか確認
docker-compose exec postgres pg_isready -U postgres

# PostgreSQLログを確認
docker-compose logs postgres
```

### **6.2 完全リセット**

```bash
# すべてのコンテナとボリュームを削除
docker-compose down -v --remove-orphans

# 使用していないDockerリソースを削除
docker system prune -a --volumes

# 再度ビルドして起動
docker-compose up -d --build
```

---

## 🌐 **外部からのアクセス設定**

### **7.1 ファイアウォール設定**

```bash
# UFWを有効化
sudo ufw enable

# 必要なポートを開放
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # フロントエンド
sudo ufw allow 8080/tcp  # バックエンド

# 設定確認
sudo ufw status
```

### **7.2 タブレットPCからのアクセス**

タブレットPCのブラウザから以下にアクセス：
- **アプリケーション**: `http://<ミニPCのIPアドレス>:3000`
- **API**: `http://<ミニPCのIPアドレス>:8080/api/posts`

---

## 📊 **システム情報確認**

### **8.1 基本情報**

```bash
# IPアドレス確認
hostname -I

# システムリソース確認
free -h
df -h

# Docker情報
docker info
docker-compose version
```

### **8.2 ログ監視**

```bash
# リアルタイムログ監視
docker-compose logs -f --tail=100

# 特定の時間範囲のログ
docker-compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T23:59:59"
```

---

## ✅ **デプロイ完了チェックリスト**

- [ ] WSL2とUbuntuがインストールされている
- [ ] SSH接続が可能
- [ ] DockerとDocker Composeがインストールされている
- [ ] アプリケーションがクローンされている
- [ ] すべてのコンテナが正常に起動している
- [ ] バックエンドAPIが応答している
- [ ] フロントエンドにアクセスできる
- [ ] 投稿の作成・表示が動作している
- [ ] 外部からアクセス可能（ファイアウォール設定済み）

---

## 🎉 **デプロイ完了！**

これで`minimum-sns-post-app1`がミニPC上のDockerコンテナで動作するようになりました。

**次のステップ**: タブレットPCからSSH接続して、リモートでの運用管理を体験してみましょう！
