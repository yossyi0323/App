# 営業準備業務モックアプリケーション

## 概要
飲食店の翌日営業準備業務を効率化するためのWebアプリケーションのモック版です。
Java/Spring Boot + Vue.js + PostgreSQLの技術スタックで構築されています。

## 技術スタック
- **バックエンド**: Java 17 + Spring Boot 3.x
- **フロントエンド**: Vue.js 3 + TypeScript
- **データベース**: PostgreSQL
- **ビルドツール**: Maven (バックエンド), Vite (フロントエンド)

## ディレクトリ構造
```
moc-app/
├── backend/          # Spring Bootアプリケーション
├── frontend/         # Vue.jsアプリケーション
├── database/         # データベース関連ファイル
└── docs/            # ドキュメント
```

## セットアップ手順

### 1. データベースセットアップ
```bash
cd database
# PostgreSQLでデータベースを作成
createdb operations_prepare_moc
# スキーマとサンプルデータを投入
psql -d operations_prepare_moc -f schema.sql
psql -d operations_prepare_moc -f sample_data.sql
```

### 2. バックエンドセットアップ
```bash
cd backend
# Mavenがインストールされている場合（推奨）
mvn clean install
mvn spring-boot:run

# Maven Wrapperを使用する場合（Windows）
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Maven Wrapperを使用する場合（Linux/Mac）
./mvnw clean install
./mvnw spring-boot:run
```
バックエンドは http://localhost:8080 で起動します。

### 3. フロントエンドセットアップ
```bash
cd frontend
npm install
npm run dev
```
フロントエンドは http://localhost:3000 で起動します。

## 動作確認
1. バックエンドとフロントエンドを起動後、ブラウザで http://localhost:3000 にアクセス
2. トップページから各業務画面に遷移できることを確認
3. 在庫確認業務で補充先を選択し、品物リストが表示されることを確認
4. 各種入力・操作が正常に動作することを確認

## 主要機能
- 在庫確認業務
- 補充（移動）業務
- 補充（作成）業務
- 発注依頼業務
- 営業準備状況一覧

## 開発方針
- 既存のSupabaseアプリケーションの業務ロジックをJava/Spring Boot + Vue.jsで再実装
- 自動保存機能の実装
- レスポンシブデザイン（スマートフォンファースト）
- ライトモード・ダークモード対応