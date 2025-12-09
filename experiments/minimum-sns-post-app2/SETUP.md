# セットアップ完了チェックリスト

このアプリケーションを動かすために必要な準備作業です。

## 前提確認

### ✅ 完了済み
- [x] PostgreSQLインストール済み（バージョン17.4確認済み）
- [x] データベース`minimum_sns_post_app2`作成済み
- [x] ユーザー`app_user`作成・権限付与済み
- [x] テーブル`posts`作成済み
- [x] `.env`ファイル作成済み

### ❌ 未完了（要対応）
- [ ] Rustインストール
- [ ] Rustツールチェーンセットアップ
- [ ] フロントエンドビルドツールインストール

---

## 必要な作業

### 1. Rustのインストール

**方法1: winget（推奨）**
```powershell
winget install Rustlang.Rustup
```

**方法2: 公式インストーラー**
https://rustup.rs/ からインストーラーをダウンロードして実行

**インストール後、PowerShellを再起動してください**（パスを反映させるため）

### 2. インストール確認

PowerShellを再起動後、以下を実行：

```powershell
rustc --version
# 出力例: rustc 1.75.0 (82e1608df 2023-12-21)

cargo --version
# 出力例: cargo 1.75.0 (1d8b05cdd 2023-11-20)
```

### 3. WebAssemblyターゲット追加（フロントエンド用）

```powershell
rustup target add wasm32-unknown-unknown
```

### 4. trunkインストール（フロントエンドビルドツール）

```powershell
cargo install trunk
```

**注意**: この処理は10-15分かかる可能性があります。

---

## 動作確認手順

### バックエンド起動

```powershell
cd minimum-sns-post-app2/server
cargo run
```

初回は依存関係のダウンロードとビルドで5-10分かかります。

起動成功メッセージ：
```
Server listening on http://0.0.0.0:8080
```

### バックエンドテスト実行（別ターミナル）

バックエンドサーバーが起動している状態で：

```powershell
cd minimum-sns-post-app2/server
cargo test
```

全15テストが成功するはずです。

### フロントエンド起動（さらに別ターミナル）

```powershell
cd minimum-sns-post-app2/front
trunk serve --open
```

初回は依存関係のダウンロードとビルドで5-10分かかります。

ブラウザが自動で開き、`http://localhost:8080`でアプリケーションが表示されます。

---

## トラブルシューティング

### cargo: コマンドが見つかりません

→ PowerShellを再起動してください（Rustインストール後のパス反映のため）

### DATABASE_URL接続エラー

→ PostgreSQLが起動しているか確認：
```powershell
# サービス確認
Get-Service postgresql*

# 起動
net start postgresql-x64-17
```

→ `.env`の内容が正しいか確認（`server/.env`）

### ポート8080が使用中

→ `.env`のSERVER_PORTを変更：
```env
SERVER_PORT=8081
```

### trunk: コマンドが見つかりません

→ trunkを再インストール：
```powershell
cargo install trunk --force
```

---

## 完了確認

以下が全て確認できれば成功です：

1. ✅ バックエンドが起動し、`Server listening on http://0.0.0.0:8080`と表示
2. ✅ テストが全て成功（`test result: ok. 15 passed; 0 failed`）
3. ✅ フロントエンドがブラウザで表示され、投稿の作成・編集・削除ができる

---

## 現状の問題

**Rustがインストールされていません。**

ターミナルで`rustc --version`が認識されないため、上記「必要な作業」の手順1-4を実行してください。

実行後、「動作確認手順」でアプリケーションを起動できます。

