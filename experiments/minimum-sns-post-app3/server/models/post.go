package models

import (
	"time"

	"github.com/google/uuid"
)

// Post represents a post in the database
type Post struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Content   string    `json:"content" db:"content"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

// CreatePostRequest represents a request to create a post
type CreatePostRequest struct {
	Content string `json:"content" binding:"required"`
}

// UpdatePostRequest represents a request to update a post
type UpdatePostRequest struct {
	Content string `json:"content" binding:"required"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}


