use crate::errors::{AppError, AppResult};
use crate::models::post::{CreatePostRequest, Post, UpdatePostRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub struct PostRepository {
    pool: PgPool,
}

impl PostRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, request: &CreatePostRequest) -> AppResult<Post> {
        request.validate()?;

        let post = sqlx::query_as::<_, Post>(
            r#"
            INSERT INTO posts (content)
            VALUES ($1)
            RETURNING id, content, created_at, updated_at
            "#,
        )
        .bind(&request.content)
        .fetch_one(&self.pool)
        .await?;

        Ok(post)
    }

    pub async fn find_all(&self) -> AppResult<Vec<Post>> {
        let posts = sqlx::query_as::<_, Post>(
            r#"
            SELECT id, content, created_at, updated_at
            FROM posts
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(posts)
    }

    pub async fn find_by_id(&self, id: Uuid) -> AppResult<Post> {
        let post = sqlx::query_as::<_, Post>(
            r#"
            SELECT id, content, created_at, updated_at
            FROM posts
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| AppError::PostNotFound(id.to_string()))?;

        Ok(post)
    }

    pub async fn update(&self, id: Uuid, request: &UpdatePostRequest) -> AppResult<Post> {
        request.validate()?;

        let post = sqlx::query_as::<_, Post>(
            r#"
            UPDATE posts
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, content, created_at, updated_at
            "#,
        )
        .bind(&request.content)
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or_else(|| AppError::PostNotFound(id.to_string()))?;

        Ok(post)
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query(
            r#"
            DELETE FROM posts
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::PostNotFound(id.to_string()));
        }

        Ok(())
    }
}

