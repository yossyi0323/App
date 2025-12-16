package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"minimum-sns-post-app3-server/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	postHandler := NewPostHandler()

	api := router.Group("/api")
	{
		posts := api.Group("/posts")
		{
			posts.POST("", postHandler.CreatePost)
			posts.GET("", postHandler.GetAllPosts)
			posts.GET("/:id", postHandler.GetPostByID)
			posts.PUT("/:id", postHandler.UpdatePost)
			posts.DELETE("/:id", postHandler.DeletePost)
		}
	}

	return router
}

func TestCreatePost_Success(t *testing.T) {
	// This test requires a running database
	// It should be run as an integration test with a test database
	router := setupTestRouter()

	reqBody := models.CreatePostRequest{Content: "Test post content"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var post models.Post
	err := json.Unmarshal(w.Body.Bytes(), &post)
	require.NoError(t, err)
	assert.NotEqual(t, uuid.Nil, post.ID)
	assert.Equal(t, "Test post content", post.Content)
	assert.False(t, post.CreatedAt.IsZero())
	assert.False(t, post.UpdatedAt.IsZero())
}

func TestCreatePost_EmptyContent(t *testing.T) {
	router := setupTestRouter()

	reqBody := models.CreatePostRequest{Content: ""}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(t, err)
	assert.Contains(t, errorResp.Error, "空にできません")
}
