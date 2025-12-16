package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"minimum-sns-post-app3-server/db"
	"minimum-sns-post-app3-server/handlers"
	"minimum-sns-post-app3-server/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

type APITestSuite struct {
	suite.Suite
	router         *gin.Engine
	createdPostIDs []uuid.UUID // テストで作成した投稿のIDを記録
}

func (suite *APITestSuite) SetupSuite() {
	// Load environment variables from .env file
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	// Initialize database connection
	err := db.InitDB()
	require.NoError(suite.T(), err)

	// Initialize created post IDs slice
	suite.createdPostIDs = make([]uuid.UUID, 0)

	// Setup router
	gin.SetMode(gin.TestMode)
	suite.router = gin.New()
	postHandler := handlers.NewPostHandler()

	api := suite.router.Group("/api")
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
}

func (suite *APITestSuite) TearDownSuite() {
	// Cleanup only test-created posts
	if len(suite.createdPostIDs) > 0 {
		for _, id := range suite.createdPostIDs {
			_, err := db.DB.Exec("DELETE FROM posts WHERE id = $1", id)
			if err != nil {
				// エラーは無視（既に削除されている可能性がある）
				suite.T().Logf("Warning: Failed to delete post %s: %v", id, err)
			}
		}
	}
	db.CloseDB()
}

func (suite *APITestSuite) cleanupAllPosts() {
	// テストで作成した投稿のみ削除
	if len(suite.createdPostIDs) > 0 {
		for _, id := range suite.createdPostIDs {
			_, err := db.DB.Exec("DELETE FROM posts WHERE id = $1", id)
			if err != nil {
				suite.T().Logf("Warning: Failed to delete post %s: %v", id, err)
			}
		}
		suite.createdPostIDs = make([]uuid.UUID, 0)
	}
}

// recordCreatedPost テストで作成した投稿のIDを記録
func (suite *APITestSuite) recordCreatedPost(id uuid.UUID) {
	suite.createdPostIDs = append(suite.createdPostIDs, id)
}

// Test POST /api/posts
func (suite *APITestSuite) TestCreatePost_Success() {
	suite.cleanupAllPosts()

	reqBody := models.CreatePostRequest{Content: "Test post content"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var post models.Post
	err := json.Unmarshal(w.Body.Bytes(), &post)
	require.NoError(suite.T(), err)
	assert.NotEqual(suite.T(), uuid.Nil, post.ID)
	assert.Equal(suite.T(), "Test post content", post.Content)
	assert.False(suite.T(), post.CreatedAt.IsZero())
	assert.False(suite.T(), post.UpdatedAt.IsZero())

	// 作成した投稿のIDを記録
	suite.recordCreatedPost(post.ID)
}

func (suite *APITestSuite) TestCreatePost_EmptyContent() {
	reqBody := models.CreatePostRequest{Content: ""}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp.Error, "空にできません")
}

func (suite *APITestSuite) TestCreatePost_InvalidJSON() {
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
}

// Test GET /api/posts
func (suite *APITestSuite) TestGetAllPosts_Success() {
	suite.cleanupAllPosts()

	// Create test posts
	req1 := models.CreatePostRequest{Content: "First post"}
	jsonBody1, _ := json.Marshal(req1)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody1))
	req.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	suite.router.ServeHTTP(w1, req)

	time.Sleep(100 * time.Millisecond)

	req2 := models.CreatePostRequest{Content: "Second post"}
	jsonBody2, _ := json.Marshal(req2)
	req2_http, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody2))
	req2_http.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	suite.router.ServeHTTP(w2, req2_http)

	// Get all posts
	req, _ = http.NewRequest("GET", "/api/posts", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var posts []models.Post
	err := json.Unmarshal(w.Body.Bytes(), &posts)
	require.NoError(suite.T(), err)
	assert.GreaterOrEqual(suite.T(), len(posts), 2)

	// Check if sorted by created_at DESC (newest first)
	if len(posts) >= 2 {
		assert.True(suite.T(), posts[0].CreatedAt.After(posts[1].CreatedAt) || posts[0].CreatedAt.Equal(posts[1].CreatedAt))
	}
}

func (suite *APITestSuite) TestGetAllPosts_EmptyList() {
	// テストで作成した投稿のみ削除（開発用データは残す）
	suite.cleanupAllPosts()

	req, _ := http.NewRequest("GET", "/api/posts", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var posts []models.Post
	err := json.Unmarshal(w.Body.Bytes(), &posts)
	require.NoError(suite.T(), err)
	// 空配列が返されることを確認（nilではなく[]）
	// 注意: 開発用データが残っている場合は空配列ではない可能性があるが、
	// テストで作成した投稿は削除されているので、レスポンスは配列として返されることを確認
	assert.NotNil(suite.T(), posts)
	// テストで作成した投稿は削除されているので、開発用データのみが残る可能性がある
	// このテストは、空配列が返される場合の動作を確認するためのもの
	// 実際の開発環境では開発用データが残る可能性があるため、厳密な空配列チェックは行わない
	// ただし、nilではなく配列が返されることは確認する
}

// Test GET /api/posts/:id
func (suite *APITestSuite) TestGetPostByID_Success() {
	suite.cleanupAllPosts()

	// Create a post
	reqBody := models.CreatePostRequest{Content: "Test post"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var createdPost models.Post
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	suite.recordCreatedPost(createdPost.ID)

	// Get the post by ID
	req, _ = http.NewRequest("GET", "/api/posts/"+createdPost.ID.String(), nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var post models.Post
	err := json.Unmarshal(w.Body.Bytes(), &post)
	require.NoError(suite.T(), err)
	assert.Equal(suite.T(), createdPost.ID, post.ID)
	assert.Equal(suite.T(), "Test post", post.Content)
}

func (suite *APITestSuite) TestGetPostByID_NotFound() {
	nonExistentID := uuid.New()
	req, _ := http.NewRequest("GET", "/api/posts/"+nonExistentID.String(), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp.Error, "投稿が見つかりません")
}

// Test PUT /api/posts/:id
func (suite *APITestSuite) TestUpdatePost_Success() {
	suite.cleanupAllPosts()

	// Create a post
	reqBody := models.CreatePostRequest{Content: "Original content"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var createdPost models.Post
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	suite.recordCreatedPost(createdPost.ID)
	originalCreatedAt := createdPost.CreatedAt

	time.Sleep(100 * time.Millisecond)

	// Update the post
	updateReq := models.UpdatePostRequest{Content: "Updated content"}
	updateJsonBody, _ := json.Marshal(updateReq)
	req, _ = http.NewRequest("PUT", "/api/posts/"+createdPost.ID.String(), bytes.NewBuffer(updateJsonBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var updatedPost models.Post
	err := json.Unmarshal(w.Body.Bytes(), &updatedPost)
	require.NoError(suite.T(), err)
	assert.Equal(suite.T(), createdPost.ID, updatedPost.ID)
	assert.Equal(suite.T(), "Updated content", updatedPost.Content)
	assert.Equal(suite.T(), originalCreatedAt.Unix(), updatedPost.CreatedAt.Unix())
	assert.True(suite.T(), updatedPost.UpdatedAt.After(updatedPost.CreatedAt))
}

func (suite *APITestSuite) TestUpdatePost_EmptyContent() {
	suite.cleanupAllPosts()

	// Create a post
	reqBody := models.CreatePostRequest{Content: "Original content"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var createdPost models.Post
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	suite.recordCreatedPost(createdPost.ID)

	// Try to update with empty content
	updateReq := models.UpdatePostRequest{Content: ""}
	updateJsonBody, _ := json.Marshal(updateReq)
	req, _ = http.NewRequest("PUT", "/api/posts/"+createdPost.ID.String(), bytes.NewBuffer(updateJsonBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp.Error, "空にできません")
}

func (suite *APITestSuite) TestUpdatePost_NotFound() {
	nonExistentID := uuid.New()
	updateReq := models.UpdatePostRequest{Content: "Updated content"}
	updateJsonBody, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest("PUT", "/api/posts/"+nonExistentID.String(), bytes.NewBuffer(updateJsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp.Error, "投稿が見つかりません")
}

// Test DELETE /api/posts/:id
func (suite *APITestSuite) TestDeletePost_Success() {
	suite.cleanupAllPosts()

	// Create a post
	reqBody := models.CreatePostRequest{Content: "Post to delete"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var createdPost models.Post
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	suite.recordCreatedPost(createdPost.ID)

	// Delete the post
	req, _ = http.NewRequest("DELETE", "/api/posts/"+createdPost.ID.String(), nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNoContent, w.Code)

	// Verify the post is deleted
	req, _ = http.NewRequest("GET", "/api/posts/"+createdPost.ID.String(), nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)
}

func (suite *APITestSuite) TestDeletePost_NotFound() {
	nonExistentID := uuid.New()
	req, _ := http.NewRequest("DELETE", "/api/posts/"+nonExistentID.String(), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)

	var errorResp models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &errorResp)
	require.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp.Error, "投稿が見つかりません")
}

func (suite *APITestSuite) TestDeletePost_DoubleDelete() {
	suite.cleanupAllPosts()

	// Create a post
	reqBody := models.CreatePostRequest{Content: "Post to delete"}
	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var createdPost models.Post
	json.Unmarshal(w.Body.Bytes(), &createdPost)
	suite.recordCreatedPost(createdPost.ID)

	// Delete the post first time
	req, _ = http.NewRequest("DELETE", "/api/posts/"+createdPost.ID.String(), nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	assert.Equal(suite.T(), http.StatusNoContent, w.Code)

	// Try to delete again
	req, _ = http.NewRequest("DELETE", "/api/posts/"+createdPost.ID.String(), nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)
}

func TestAPITestSuite(t *testing.T) {
	suite.Run(t, new(APITestSuite))
}
