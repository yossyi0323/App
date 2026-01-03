# 開発環境セットアップ手順（2025年5月移行対応）

---

## 今回（2025/05/17）の移行で変わった部分

- フロントエンドをVue.js→Next.js（TypeScript）に全面移行
- バックエンドをJava/Spring Boot→Supabase（PostgreSQL）に全面移行
- UIはshadcn/ui＋Tailwind CSSで構築
- 認証はSupabase Auth（Googleログイン）

---

## 必要なソフトウェア

1. Node.js（LTS版推奨）
2. npm
3. Supabase CLI（任意、マイグレーションや型生成用）

---

## プロジェクトのセットアップ

1. リポジトリをクローン

```bash
 git clone [YOUR_REPO_URL]
 cd operations-prepare
```

2. 依存パッケージのインストール

```bash
 npm install
```

3. 環境変数の設定

- `.env.local` を作成し、下記を記入

```
NEXT_PUBLIC_SUPABASE_URL=（SupabaseプロジェクトのURL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（SupabaseのAnonキー）
```

4. 開発サーバーの起動

```bash
 npm run dev
```

5. SupabaseのDBマイグレーション（必要に応じて）

- Supabase StudioのSQL EditorでマイグレーションSQLを実行
- またはSupabase CLIで適用

---

## 使用技術・主なライブラリ

- Next.js 15（TypeScript）
- Supabase（PostgreSQL, Auth, Storage）
- shadcn/ui（UIコンポーネント）
- Tailwind CSS
- Vitest（テスト、今後導入予定）

---

## 注意事項

- 環境変数は必ず`.env.local`で管理
- DBスキーマ・マイグレーションはSupabase管理画面または`src/db`配下で一元管理
- 変更時は必ずドキュメントも最新化
