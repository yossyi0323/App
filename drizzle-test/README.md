# Drizzle ORM + Next.js Test Project

Drizzle ORMの機能を試すためのテストプロジェクトです。

## セットアップ

```bash
npm install
npm run db:generate  # マイグレーションファイル生成
npm run db:push       # DBにテーブル作成
npm run db:seed       # テストデータ挿入
npm run dev           # 開発サーバー起動
```

## 利用可能なコマンド

```bash
npm run dev          # 開発サーバー起動
npm run db:generate  # スキーマからマイグレーションファイルを生成
npm run db:push      # DBにテーブルを作成・更新
npm run db:studio    # Drizzle Studio（DBの可視化ツール）を起動
npm run db:seed      # テストデータを挿入
```

## データベース構造

### テーブル

- **users**: ユーザー情報
- **posts**: 投稿（usersと1対多）
- **comments**: コメント（postsと1対多、usersと1対多）
- **tags**: タグ
- **post_tags**: 投稿とタグの中間テーブル（多対多リレーション）

### リレーション

- `users` 1 → 多 `posts` (authorId)
- `users` 1 → 多 `comments` (authorId)
- `posts` 1 → 多 `comments` (postId)
- `posts` 多 ↔ 多 `tags` (post_tags中間テーブル)

### ビュー

- **post_stats**: 各投稿の統計（コメント数、タグ数など）
- **user_stats**: 各ユーザーの統計（投稿数、コメント数など）
- **tag_usage_stats**: 各タグの使用回数

## トランザクションの例

`src/db/transactions.ts` に以下のトランザクション例があります：

1. **createPostWithComment**: 投稿とコメントを同時に作成
2. **addTagsToPost**: 投稿に複数のタグを追加
3. **createUserWithFirstPost**: ユーザーと最初の投稿を同時に作成
4. **deletePostWithCascade**: 投稿を削除（カスケード削除の確認）

## Drizzle Studioで確認

```bash
npm run db:studio
```

ブラウザで `http://localhost:4983` が開き、以下を確認できます：

- すべてのテーブルとデータ
- リレーションの可視化
- ビューの内容
- データの編集・追加・削除

## 学習ポイント

1. **リレーション**: `relations()` で1対多、多対多を定義
2. **トランザクション**: `db.transaction()` で原子性を保証
3. **ビュー**: SQLiteビューで集計クエリを簡潔に
4. **カスケード削除**: 外部キー制約で自動削除
