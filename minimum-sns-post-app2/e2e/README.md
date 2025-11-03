# E2Eテスト（Playwright）

## 概要

minimum-sns-post-app2のE2Eテストスイート。Playwrightを使用してブラウザ上での動作を検証します。

## セットアップ

### 前提条件

- Node.js 18以上
- サーバーが起動していること（`http://localhost:8080`）

### インストール

```bash
cd e2e
npm install
npx playwright install chromium
```

## テスト実行

### 基本実行

```bash
# 全テスト実行
npm test

# 特定のテストファイルのみ実行
npx playwright test tests/post-creation.spec.ts

# 特定のテストケースのみ実行
npx playwright test -g "TC-E2E-001"
```

### デバッグ・開発

```bash
# UIモードで実行（推奨：インタラクティブにデバッグ可能）
npm run test:ui

# ヘッドフルモードで実行（ブラウザが見える）
npm run test:headed

# デバッグモード（ステップ実行可能）
npm run test:debug
```

### レポート

```bash
# HTMLレポートを表示
npm run report
```

## テストケース

全22ケースを実装済み。詳細は [`TEST_CASES.md`](./TEST_CASES.md) を参照。

### カテゴリ

1. **投稿作成機能**（5ケース）
2. **投稿一覧表示機能**（5ケース）
3. **投稿編集機能**（6ケース）
4. **投稿削除機能**（4ケース）
5. **統合フロー**（2ケース）

## ファイル構造

```
e2e/
├── tests/
│   ├── post-creation.spec.ts    # 投稿作成
│   ├── post-list.spec.ts        # 投稿一覧
│   ├── post-edit.spec.ts        # 投稿編集
│   ├── post-delete.spec.ts      # 投稿削除
│   └── integration-flow.spec.ts # 統合フロー
├── playwright.config.ts         # Playwright設定
├── package.json                 # 依存関係
├── TEST_CASES.md                # テストケース一覧
└── README.md                    # このファイル
```

## トラブルシューティング

### サーバーが起動していない

```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**対処**: サーバーを起動してからテストを実行してください。

```bash
# 別ターミナルで
cd ../server
cargo run
```

### テストが失敗する

1. サーバーが正常に動作しているか確認
2. データベースが起動しているか確認
3. `npm run test:headed` でブラウザの動作を確認
4. `npm run test:ui` でステップバイステップで実行

### ブラウザが見つからない

```bash
npx playwright install chromium
```

## CI/CD統合

GitHub Actionsなどのサンプル：

```yaml
- name: Install dependencies
  run: cd e2e && npm ci

- name: Install Playwright Browsers
  run: cd e2e && npx playwright install --with-deps chromium

- name: Run E2E tests
  run: cd e2e && npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: e2e/playwright-report/
```

