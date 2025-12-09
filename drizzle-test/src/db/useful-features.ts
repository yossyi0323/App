import { db } from "./index";
import { users, posts, comments, tags, postTags } from "./schema";
import { eq, and, or, like, gt, count, sql, desc, asc, inArray } from "drizzle-orm";

// ===== 1. リレーションを使ったJOIN（自動JOIN） =====
// リレーション定義を使えば、JOINを自動で行ってくれる

export async function getPostWithAuthor(postId: number) {
	// 手動JOIN
	const result = await db
		.select({
			post: posts,
			author: users,
		})
		.from(posts)
		.innerJoin(users, eq(posts.authorId, users.id))
		.where(eq(posts.id, postId))
		.limit(1);

	return result[0];
}

// ===== 2. 集計関数（COUNT, SUM, AVGなど） =====
export async function getPostStats() {
	// 投稿数、コメント数、平均コメント数を取得
	const stats = await db
		.select({
			totalPosts: count(posts.id),
			totalComments: count(comments.id),
			publishedPosts: sql<number>`COUNT(CASE WHEN ${posts.published} = 1 THEN 1 END)`.as("published_posts"),
		})
		.from(posts)
		.leftJoin(comments, eq(posts.id, comments.postId));

	return stats[0];
}

// ===== 3. サブクエリ =====
export async function getUsersWithPostCount() {
	// サブクエリで各ユーザーの投稿数を取得
	const subquery = db
		.select({
			authorId: posts.authorId,
			postCount: count(posts.id).as("post_count"),
		})
		.from(posts)
		.groupBy(posts.authorId)
		.as("post_counts");

	const result = await db
		.select({
			user: users,
			postCount: subquery.postCount,
		})
		.from(users)
		.leftJoin(subquery, eq(users.id, subquery.authorId));

	return result;
}

// ===== 4. バッチ操作（Bulk Insert/Update） =====
export async function bulkCreateUsers(userData: Array<{ name: string; email: string }>) {
	// 複数のユーザーを一度に作成
	const insertedUsers = await db.insert(users).values(userData).returning();
	return insertedUsers;
}

export async function bulkUpdatePosts(postIds: number[], updates: { published?: boolean; title?: string }) {
	// 複数の投稿を一度に更新
	const updatedPosts = await db
		.update(posts)
		.set(updates)
		.where(inArray(posts.id, postIds))
		.returning();

	return updatedPosts;
}

// ===== 5. 部分更新（Partial Updates） =====
export async function updatePostPartial(postId: number, updates: Partial<{ title: string; content: string; published: boolean }>) {
	// 指定したフィールドだけを更新（updatedAtも自動更新）
	const updatedPost = await db
		.update(posts)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
		.returning();

	return updatedPost[0];
}

// ===== 6. ページネーション =====
export async function getPostsPaginated(page: number = 1, pageSize: number = 10) {
	const offset = (page - 1) * pageSize;

	const [data, totalCountResult] = await Promise.all([
		// データ取得
		db
			.select({
				post: posts,
				author: users,
				commentCount: sql<number>`COUNT(${comments.id})`.as("comment_count"),
			})
			.from(posts)
			.innerJoin(users, eq(posts.authorId, users.id))
			.leftJoin(comments, eq(posts.id, comments.postId))
			.groupBy(posts.id, users.id)
			.orderBy(desc(posts.createdAt))
			.limit(pageSize)
			.offset(offset),
		// 総件数取得
		db.select({ count: count() }).from(posts),
	]);

	return {
		data,
		pagination: {
			page,
			pageSize,
			total: totalCountResult[0].count,
			totalPages: Math.ceil(totalCountResult[0].count / pageSize),
		},
	};
}

// ===== 7. 複雑な条件クエリ =====
export async function searchPosts(keyword: string, tagIds?: number[], authorId?: number) {
	// キーワード検索 + タグフィルタ + 著者フィルタ
	const conditions = [like(posts.title, `%${keyword}%`)];

	if (tagIds && tagIds.length > 0) {
		// 指定したタグのいずれかを持つ投稿
		const postsWithTags = db
			.selectDistinct({ postId: postTags.postId })
			.from(postTags)
			.where(inArray(postTags.tagId, tagIds));

		conditions.push(inArray(posts.id, sql`(${postsWithTags})`));
	}

	if (authorId) {
		conditions.push(eq(posts.authorId, authorId));
	}

	const result = await db
		.select({
			post: posts,
			author: users,
			tags: sql<string>`GROUP_CONCAT(${tags.name})`.as("tag_names"),
		})
		.from(posts)
		.innerJoin(users, eq(posts.authorId, users.id))
		.leftJoin(postTags, eq(posts.id, postTags.postId))
		.leftJoin(tags, eq(postTags.tagId, tags.id))
		.where(and(...conditions))
		.groupBy(posts.id, users.id)
		.orderBy(desc(posts.createdAt));

	return result;
}

// ===== 8. 存在チェック（EXISTS） =====
export async function hasUserCommentedOnPost(userId: number, postId: number): Promise<boolean> {
	const result = await db
		.select({ exists: sql<number>`1`.as("exists") })
		.from(comments)
		.where(and(eq(comments.authorId, userId), eq(comments.postId, postId)))
		.limit(1);

	return result.length > 0;
}

// ===== 9. カウント付きJOIN =====
export async function getPostsWithCommentCount() {
	// 各投稿のコメント数を取得
	const result = await db
		.select({
			post: posts,
			author: users,
			commentCount: sql<number>`COUNT(${comments.id})`.as("comment_count"),
		})
		.from(posts)
		.innerJoin(users, eq(posts.authorId, users.id))
		.leftJoin(comments, eq(posts.id, comments.postId))
		.groupBy(posts.id, users.id)
		.orderBy(desc(sql`comment_count`));

	return result;
}

// ===== 10. 条件付き集計（HAVING） =====
export async function getActiveUsers(minPostCount: number = 1) {
	// 指定数以上の投稿を持つユーザーを取得
	const result = await db
		.select({
			user: users,
			postCount: count(posts.id).as("post_count"),
		})
		.from(users)
		.innerJoin(posts, eq(users.id, posts.authorId))
		.groupBy(users.id)
		.having(sql`COUNT(${posts.id}) >= ${minPostCount}`)
		.orderBy(desc(sql`post_count`));

	return result;
}

// ===== 11. 複数テーブルからの一括取得（UNION的な操作） =====
export async function getUserActivity(userId: number) {
	// ユーザーの投稿とコメントを時系列で取得
	const userPosts = db
		.select({
			type: sql<"post">`'post'`.as("type"),
			id: posts.id,
			title: posts.title,
			createdAt: posts.createdAt,
		})
		.from(posts)
		.where(eq(posts.authorId, userId));

	const userComments = db
		.select({
			type: sql<"comment">`'comment'`.as("type"),
			id: comments.id,
			title: sql<string>`${comments.content}`.as("title"),
			createdAt: comments.createdAt,
		})
		.from(comments)
		.where(eq(comments.authorId, userId));

	// SQLiteではUNION ALLを直接サポートしていないので、別々に取得して結合
	const [postsData, commentsData] = await Promise.all([userPosts, userComments]);

	return [...postsData, ...commentsData].sort((a, b) => {
		const dateA = a.createdAt?.getTime() || 0;
		const dateB = b.createdAt?.getTime() || 0;
		return dateB - dateA; // 新しい順
	});
}

// ===== 12. 型安全なクエリビルダーの再利用 =====
// クエリを関数として定義して再利用可能にする

const basePostQuery = () =>
	db
		.select({
			post: posts,
			author: users,
		})
		.from(posts)
		.innerJoin(users, eq(posts.authorId, users.id));

export async function getPublishedPosts() {
	return basePostQuery().where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
}

export async function getRecentPosts(limit: number = 5) {
	return basePostQuery().orderBy(desc(posts.createdAt)).limit(limit);
}

// ===== 13. カスケード削除の確認 =====
export async function deleteUserWithCascade(userId: number) {
	// ユーザーを削除すると、関連するpostsとcommentsも自動削除される
	const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();

	// 確認：関連データが削除されているか
	const remainingPosts = await db.select().from(posts).where(eq(posts.authorId, userId));
	const remainingComments = await db.select().from(comments).where(eq(comments.authorId, userId));

	return {
		deletedUser: deletedUser[0],
		remainingPostsCount: remainingPosts.length, // 0になるはず
		remainingCommentsCount: remainingComments.length, // 0になるはず
	};
}

