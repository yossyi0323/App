import { sql } from "drizzle-orm";
import { db } from "./index";

// ===== ビュー作成関数 =====
// SQLiteでは、Drizzleのビュー定義は直接サポートされていないため、
// 生SQLでビューを作成する

export async function createViews() {
	const sqlite = db;

	// 1. 投稿統計ビュー（各投稿のコメント数、タグ数を集計）
	await sqlite.run(sql`
		CREATE VIEW IF NOT EXISTS post_stats AS
		SELECT 
			p.id,
			p.title,
			p.author_id,
			u.name AS author_name,
			COUNT(DISTINCT c.id) AS comment_count,
			COUNT(DISTINCT pt.tag_id) AS tag_count,
			p.published,
			p.created_at
		FROM posts p
		LEFT JOIN users u ON p.author_id = u.id
		LEFT JOIN comments c ON p.id = c.post_id
		LEFT JOIN post_tags pt ON p.id = pt.post_id
		GROUP BY p.id, p.title, p.author_id, u.name, p.published, p.created_at
	`);

	// 2. ユーザー統計ビュー（各ユーザーの投稿数、コメント数を集計）
	await sqlite.run(sql`
		CREATE VIEW IF NOT EXISTS user_stats AS
		SELECT 
			u.id,
			u.name,
			u.email,
			COUNT(DISTINCT p.id) AS post_count,
			COUNT(DISTINCT c.id) AS comment_count,
			u.created_at
		FROM users u
		LEFT JOIN posts p ON u.id = p.author_id
		LEFT JOIN comments c ON u.id = c.author_id
		GROUP BY u.id, u.name, u.email, u.created_at
	`);

	// 3. タグ使用統計ビュー（各タグの使用回数）
	await sqlite.run(sql`
		CREATE VIEW IF NOT EXISTS tag_usage_stats AS
		SELECT 
			t.id,
			t.name,
			t.color,
			COUNT(pt.post_id) AS usage_count,
			t.created_at
		FROM tags t
		LEFT JOIN post_tags pt ON t.id = pt.tag_id
		GROUP BY t.id, t.name, t.color, t.created_at
	`);

	console.log("Views created successfully!");
}

