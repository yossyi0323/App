# 料理サイクル - moc1

レシピとストックを管理するアプリケーション（モックアップ版）

## 技術スタック

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Database**: PostgreSQL, Drizzle ORM
- **Authentication**: NextAuth.js (Google OAuth 2.0)
- **Validation**: Zod

## セットアップ

### 1. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cooking_cycle

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Phase
NEXT_PUBLIC_APP_PHASE=1
```

### 2. データベースのセットアップ

```bash
# マイグレーションを実行
npm run db:push

# または、SQLファイルを直接実行
psql -U postgres -d cooking_cycle -f database/migrations/0000_early_nebula.sql
psql -U postgres -d cooking_cycle -f database/migrations/0001_add_triggers_and_constraints.sql
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## 機能

### Phase 1（実装済み）

- ✅ レシピ管理（登録・編集・削除・一覧・詳細）
- ✅ ストック管理（登録・編集・削除・一覧・詳細）
- ✅ ストック優先フィルター（ワンクリックで作れるレシピを表示）
- ✅ Google認証
- ✅ PWA対応

### Phase 2以降（未実装）

- 食材の状態遷移の本格的な管理（正規化）
- タグ機能
- 高度な検索

## プロジェクト構造

```
moc1/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── recipes/           # レシピ関連ページ
│   ├── stocks/            # ストック関連ページ
│   └── auth/              # 認証ページ
├── components/             # Reactコンポーネント
│   └── ui/                # shadcn/uiコンポーネント
├── lib/                    # ユーティリティ
│   ├── db.ts             # データベース接続
│   ├── schema.ts         # Drizzleスキーマ
│   └── auth.ts           # 認証ヘルパー
├── database/              # データベース関連
│   └── migrations/       # SQLマイグレーション
└── public/                # 静的ファイル
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# データベースマイグレーション生成
npm run db:generate

# データベースにプッシュ
npm run db:push

# Drizzle Studio起動
npm run db:studio
```

## 注意事項

- Phase 1の実装のため、一部機能は簡易実装です
- エラーハンドリングは基本的なもののみ実装
- テストコードは未実装
