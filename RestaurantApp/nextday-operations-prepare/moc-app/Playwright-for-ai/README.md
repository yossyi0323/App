# moc-app Explorer with Playwright

AIがmoc-appを探索・確認するためのPlaywrightスクリプト集

## セットアップ

```powershell
cd Playwright-for-ai
npm install
```

## 使い方

### 1. アプリを起動しておく

別のターミナルで：
- バックエンド: `cd backend && mvn spring-boot:run`
- フロントエンド: `cd frontend && npm run dev`

### 2. 探索スクリプトを実行

```powershell
# ブラウザを表示しながら実行（推奨）
npm run explore

# ヘッドレスモードで実行
npm run explore:headless
```

## 出力

- スクリーンショット: `test-results/` ディレクトリ
- 動画: `test-results/` ディレクトリ
- コンソールログ: ターミナルに表示

## スクリプト一覧

### explore-app.spec.js
- 全画面（Home, Inventory, Replenishment, Creation, Order, Status）にアクセス
- 各画面のスクリーンショットを撮影
- ページ内の要素（ボタン、リンク、入力欄など）を調査

