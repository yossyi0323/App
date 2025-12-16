package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"minimum-sns-post-app3-server/models"
	"minimum-sns-post-app3-server/repository"
)

type PostHandler struct {
	repo *repository.PostRepository
}

// NewPostHandler creates a new PostHandler
func NewPostHandler() *PostHandler {
	return &PostHandler{
		repo: repository.NewPostRepository(),
	}
}

// CreatePost handles POST /api/posts
func (h *PostHandler) CreatePost(c *gin.Context) {
	var req models.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "content は空にできません"})
		return
	}

	if err := repository.ValidateContent(req.Content); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	post, err := h.repo.CreatePost(req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, post)
}

// GetAllPosts handles GET /api/posts
func (h *PostHandler) GetAllPosts(c *gin.Context) {
	posts, err := h.repo.GetAllPosts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// GetPostByID handles GET /api/posts/:id
func (h *PostHandler) GetPostByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid id format"})
		return
	}

	post, err := h.repo.GetPostByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	if post == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "投稿が見つかりません"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// UpdatePost handles PUT /api/posts/:id
func (h *PostHandler) UpdatePost(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid id format"})
		return
	}

	var req models.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "content は空にできません"})
		return
	}

	if err := repository.ValidateContent(req.Content); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	post, err := h.repo.UpdatePost(id, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	if post == nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "投稿が見つかりません"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// DeletePost handles DELETE /api/posts/:id
func (h *PostHandler) DeletePost(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid id format"})
		return
	}

	err = h.repo.DeletePost(id)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, models.ErrorResponse{Error: "投稿が見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}


