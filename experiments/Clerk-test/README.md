# Clerk Test App

Clerk認証ライブラリの機能を試すためのNext.jsアプリケーションです。

## 概要

このアプリは[Clerk](https://clerk.com/)の認証機能を試すためのサンプルアプリです。以下の機能をテストできます：

- ユーザー認証（サインイン/サインアップ）
- ユーザープロフィール管理
- セキュリティ設定
- ソーシャルログイン
- 多要素認証

## 技術スタック

- **Next.js 15** (App Router)
- **TypeScript**
- **Clerk** (@clerk/nextjs)
- **Tailwind CSS**

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Clerkの設定

Clerkは起動時に自動的にキーを生成するため、初期設定は不要です。開発環境では自動的にキーが生成されます。

本番環境やカスタム設定が必要な場合は、[Clerk Dashboard](https://dashboard.clerk.com/)でアプリケーションを作成し、環境変数を設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構成

```
Clerk-test/
├── app/
│   ├── layout.tsx      # ClerkProviderでラップされたルートレイアウト
│   ├── page.tsx         # メインページ
│   └── globals.css      # グローバルスタイル
├── proxy.ts             # Clerk middleware設定
├── package.json
└── README.md
```

## Clerk統合のポイント

### Middleware (`proxy.ts`)

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()
```

### Layout (`app/layout.tsx`)

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {/* ... */}
    </ClerkProvider>
  );
}
```

### コンポーネントの使用

- `<SignInButton />` - サインインボタン
- `<SignUpButton />` - サインアップボタン
- `<UserButton />` - ユーザーメニューボタン
- `<UserProfile />` - ユーザープロフィール管理
- `<SignedIn />` / `<SignedOut />` - 認証状態に応じた表示制御

## 参考リンク

- [Clerk公式ドキュメント](https://clerk.com/docs)
- [Next.js App Router統合ガイド](https://clerk.com/docs/nextjs/getting-started/quickstart)

