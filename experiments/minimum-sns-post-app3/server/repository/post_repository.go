package repository

import (
	"database/sql"
	"fmt"
	"time"

	"minimum-sns-post-app3-server/db"
	"minimum-sns-post-app3-server/models"

	"github.com/google/uuid"
)

// PostRepository handles database operations for posts
type PostRepository struct{}

// NewPostRepository creates a new PostRepository
func NewPostRepository() *PostRepository {
	return &PostRepository{}
}

// CreatePost creates a new post
func (r *PostRepository) CreatePost(content string) (*models.Post, error) {
	var post models.Post
	query := `
		INSERT INTO posts (id, content, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, content, created_at, updated_at
	`
	err := db.DB.QueryRow(query, content).Scan(
		&post.ID,
		&post.Content,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create post: %w", err)
	}
	return &post, nil
}

// GetAllPosts retrieves all posts ordered by created_at DESC (newest first)
func (r *PostRepository) GetAllPosts() ([]models.Post, error) {
	query := `
		SELECT id, content, created_at, updated_at
		FROM posts
		ORDER BY created_at DESC
	`
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to get posts: %w", err)
	}
	defer rows.Close()

	// 空配列として初期化（nilスライスではなく、JSONで[]になるように）
	posts := make([]models.Post, 0)
	for rows.Next() {
		var post models.Post
		err := rows.Scan(
			&post.ID,
			&post.Content,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating posts: %w", err)
	}

	return posts, nil
}

// GetPostByID retrieves a post by ID
func (r *PostRepository) GetPostByID(id uuid.UUID) (*models.Post, error) {
	var post models.Post
	query := `
		SELECT id, content, created_at, updated_at
		FROM posts
		WHERE id = $1
	`
	err := db.DB.QueryRow(query, id).Scan(
		&post.ID,
		&post.Content,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	return &post, nil
}

// UpdatePost updates a post
func (r *PostRepository) UpdatePost(id uuid.UUID, content string) (*models.Post, error) {
	var post models.Post
	query := `
		UPDATE posts
		SET content = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING id, content, created_at, updated_at
	`
	err := db.DB.QueryRow(query, content, id).Scan(
		&post.ID,
		&post.Content,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update post: %w", err)
	}
	return &post, nil
}

// DeletePost deletes a post
func (r *PostRepository) DeletePost(id uuid.UUID) error {
	query := `DELETE FROM posts WHERE id = $1`
	result, err := db.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("sql: no rows in result set")
	}

	return nil
}

// validateContent validates that content is not empty
func ValidateContent(content string) error {
	if content == "" {
		return fmt.Errorf("content は空にできません")
	}
	return nil
}

// Helper function to convert time.Time to RFC3339 string for JSON
func FormatTime(t time.Time) string {
	return t.Format(time.RFC3339)
}
