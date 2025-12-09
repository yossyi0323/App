import { db } from "./index";
import { users, posts, comments, tags, postTags } from "./schema";
import { createViews } from "./views";

async function seed() {
	console.log("Seeding database...");

	// 既存データをクリア（外部キー制約のため順序が重要）
	await db.delete(postTags);
	await db.delete(comments);
	await db.delete(posts);
	await db.delete(tags);
	await db.delete(users);

	// ===== 1. ユーザーを作成 =====
	console.log("Creating users...");
	const insertedUsers = await db
		.insert(users)
		.values([
			{ name: "Alice", email: "alice@example.com" },
			{ name: "Bob", email: "bob@example.com" },
			{ name: "Charlie", email: "charlie@example.com" },
			{ name: "Diana", email: "diana@example.com" },
			{ name: "Eve", email: "eve@example.com" },
		])
		.returning();

	console.log(`Created ${insertedUsers.length} users`);

	// ===== 2. タグを作成 =====
	console.log("Creating tags...");
	const insertedTags = await db
		.insert(tags)
		.values([
			{ name: "TypeScript", color: "#3178c6" },
			{ name: "React", color: "#61dafb" },
			{ name: "Next.js", color: "#000000" },
			{ name: "Drizzle", color: "#ff6b6b" },
			{ name: "Database", color: "#4ecdc4" },
			{ name: "Tutorial", color: "#ffe66d" },
		])
		.returning();

	console.log(`Created ${insertedTags.length} tags`);

	// ===== 3. 投稿を作成（リレーション: users 1対多 posts） =====
	console.log("Creating posts...");
	const insertedPosts = await db
		.insert(posts)
		.values([
			{
				title: "Drizzle ORM入門",
				content: "Drizzle ORMの基本的な使い方を学びましょう。",
				authorId: insertedUsers[0].id, // Alice
				published: true,
			},
			{
				title: "Next.js App Routerでデータベース接続",
				content: "Server ComponentsとServer ActionsでのDB操作について。",
				authorId: insertedUsers[0].id, // Alice
				published: true,
			},
			{
				title: "リレーションの実装方法",
				content: "1対多、多対多のリレーションを実装する方法。",
				authorId: insertedUsers[1].id, // Bob
				published: true,
			},
			{
				title: "トランザクションの使い方",
				content: "複数の操作を原子性を持たせる方法。",
				authorId: insertedUsers[1].id, // Bob
				published: false, // 下書き
			},
			{
				title: "ビューとクエリ最適化",
				content: "SQLiteビューを使ったクエリ最適化のテクニック。",
				authorId: insertedUsers[2].id, // Charlie
				published: true,
			},
		])
		.returning();

	console.log(`Created ${insertedPosts.length} posts`);

	// ===== 4. コメントを作成（リレーション: posts 1対多 comments, users 1対多 comments） =====
	console.log("Creating comments...");
	await db.insert(comments).values([
		{
			content: "とても参考になりました！",
			postId: insertedPosts[0].id,
			authorId: insertedUsers[1].id, // Bob
		},
		{
			content: "質問があります。リレーションは自動でJOINされますか？",
			postId: insertedPosts[0].id,
			authorId: insertedUsers[2].id, // Charlie
		},
		{
			content: "いい記事ですね。続きを期待しています。",
			postId: insertedPosts[0].id,
			authorId: insertedUsers[3].id, // Diana
		},
		{
			content: "Server Actionsでの実装例も見たいです。",
			postId: insertedPosts[1].id,
			authorId: insertedUsers[2].id, // Charlie
		},
		{
			content: "トランザクションの例、わかりやすかったです。",
			postId: insertedPosts[3].id,
			authorId: insertedUsers[0].id, // Alice
		},
	]);

	console.log("Created comments");

	// ===== 5. 投稿とタグの関連付け（多対多リレーション） =====
	console.log("Creating post-tag relationships...");
	await db.insert(postTags).values([
		// 投稿1: Drizzle ORM入門
		{ postId: insertedPosts[0].id, tagId: insertedTags[0].id }, // TypeScript
		{ postId: insertedPosts[0].id, tagId: insertedTags[3].id }, // Drizzle
		{ postId: insertedPosts[0].id, tagId: insertedTags[4].id }, // Database
		{ postId: insertedPosts[0].id, tagId: insertedTags[5].id }, // Tutorial

		// 投稿2: Next.js App Routerでデータベース接続
		{ postId: insertedPosts[1].id, tagId: insertedTags[1].id }, // React
		{ postId: insertedPosts[1].id, tagId: insertedTags[2].id }, // Next.js
		{ postId: insertedPosts[1].id, tagId: insertedTags[3].id }, // Drizzle

		// 投稿3: リレーションの実装方法
		{ postId: insertedPosts[2].id, tagId: insertedTags[3].id }, // Drizzle
		{ postId: insertedPosts[2].id, tagId: insertedTags[4].id }, // Database
		{ postId: insertedPosts[2].id, tagId: insertedTags[5].id }, // Tutorial

		// 投稿4: トランザクションの使い方
		{ postId: insertedPosts[3].id, tagId: insertedTags[3].id }, // Drizzle
		{ postId: insertedPosts[3].id, tagId: insertedTags[4].id }, // Database

		// 投稿5: ビューとクエリ最適化
		{ postId: insertedPosts[4].id, tagId: insertedTags[4].id }, // Database
		{ postId: insertedPosts[4].id, tagId: insertedTags[5].id }, // Tutorial
	]);

	console.log("Created post-tag relationships");

	// ===== 6. ビューを作成 =====
	console.log("Creating views...");
	await createViews();

	console.log("Seed completed!");
	console.log("\n=== Summary ===");
	console.log(`Users: ${insertedUsers.length}`);
	console.log(`Tags: ${insertedTags.length}`);
	console.log(`Posts: ${insertedPosts.length}`);
	console.log("Comments: 5");
	console.log("Post-Tag relationships: 13");
	console.log("Views: 3 (post_stats, user_stats, tag_usage_stats)");
}

seed()
	.catch((e) => {
		console.error("Error seeding database:", e);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
