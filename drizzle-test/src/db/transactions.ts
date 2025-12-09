import { db } from "./index";
import { users, posts, comments, tags, postTags } from "./schema";
import { eq } from "drizzle-orm";

// ===== トランザクションの例 =====

/**
 * 例1: 投稿とコメントを同時に作成（トランザクション）
 * 投稿が失敗したらコメントも作成されない
 */
export async function createPostWithComment(
	authorId: number,
	postTitle: string,
	postContent: string,
	commentContent: string
) {
	return await db.transaction(async (tx) => {
		// 1. 投稿を作成
		const [newPost] = await tx
			.insert(posts)
			.values({
				title: postTitle,
				content: postContent,
				authorId: authorId,
				published: true,
			})
			.returning();

		// 2. その投稿にコメントを追加
		const [newComment] = await tx
			.insert(comments)
			.values({
				content: commentContent,
				postId: newPost.id,
				authorId: authorId,
			})
			.returning();

		return { post: newPost, comment: newComment };
	});
}

/**
 * 例2: 投稿にタグを複数追加（トランザクション）
 * すべてのタグ追加が成功するか、すべて失敗する
 */
export async function addTagsToPost(postId: number, tagIds: number[]) {
	return await db.transaction(async (tx) => {
		// 投稿が存在するか確認
		const post = await tx.select().from(posts).where(eq(posts.id, postId)).limit(1);
		if (post.length === 0) {
			throw new Error(`Post with id ${postId} not found`);
		}

		// 複数のタグを一度に追加
		const insertedTags = await tx
			.insert(postTags)
			.values(tagIds.map((tagId) => ({ postId, tagId })))
			.returning();

		return insertedTags;
	});
}

/**
 * 例3: ユーザーとその最初の投稿を同時に作成（トランザクション）
 */
export async function createUserWithFirstPost(
	userName: string,
	userEmail: string,
	postTitle: string,
	postContent: string
) {
	return await db.transaction(async (tx) => {
		// 1. ユーザーを作成
		const [newUser] = await tx
			.insert(users)
			.values({
				name: userName,
				email: userEmail,
			})
			.returning();

		// 2. そのユーザーの最初の投稿を作成
		const [newPost] = await tx
			.insert(posts)
			.values({
				title: postTitle,
				content: postContent,
				authorId: newUser.id,
				published: true,
			})
			.returning();

		return { user: newUser, post: newPost };
	});
}

/**
 * 例4: 投稿を削除（カスケード削除の確認）
 * 投稿を削除すると、関連するコメントとpost_tagsも自動的に削除される
 */
export async function deletePostWithCascade(postId: number) {
	return await db.transaction(async (tx) => {
		// 投稿を削除（カスケードでコメントとpost_tagsも削除される）
		const deletedPost = await tx.delete(posts).where(eq(posts.id, postId)).returning();

		// 削除された投稿に関連するコメント数を確認（0になるはず）
		const remainingComments = await tx
			.select()
			.from(comments)
			.where(eq(comments.postId, postId));

		return {
			deletedPost: deletedPost[0],
			remainingCommentsCount: remainingComments.length, // 0になるはず
		};
	});
}

