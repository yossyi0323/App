package com.example.anonymousmemo.controller;

import com.example.anonymousmemo.dto.PostRequest;
import com.example.anonymousmemo.dto.PostResponse;
import com.example.anonymousmemo.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
@DisplayName("PostController のテスト")
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @Autowired
    private ObjectMapper objectMapper;

    private PostResponse samplePost1;
    private PostResponse samplePost2;

    @BeforeEach
    void setUp() {
        samplePost1 = new PostResponse(1L, "テスト投稿1", LocalDateTime.of(2025, 8, 30, 10, 0, 0));
        samplePost2 = new PostResponse(2L, "テスト投稿2", LocalDateTime.of(2025, 8, 30, 11, 0, 0));
    }

    @Test
    @DisplayName("GET /api/posts - 全投稿取得が正常に動作する")
    void getAllPosts_ShouldReturnAllPosts() throws Exception {
        // Given
        List<PostResponse> posts = Arrays.asList(samplePost1, samplePost2);
        when(postService.getAllPosts()).thenReturn(posts);

        // When & Then
        mockMvc.perform(get("/api/posts")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].content", is("テスト投稿1")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].content", is("テスト投稿2")));
    }

    @Test
    @DisplayName("GET /api/posts - 投稿が空の場合は空のリストを返す")
    void getAllPosts_WhenEmpty_ShouldReturnEmptyList() throws Exception {
        // Given
        when(postService.getAllPosts()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/posts")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("POST /api/posts - 正常な投稿作成が成功する")
    void createPost_WithValidRequest_ShouldReturnCreatedPost() throws Exception {
        // Given
        PostRequest request = new PostRequest("新しい投稿内容");
        when(postService.createPost(any(PostRequest.class))).thenReturn(samplePost1);

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @DisplayName("POST /api/posts - 空の内容では400エラーが返される")
    void createPost_WithEmptyContent_ShouldReturnBadRequest() throws Exception {
        // Given
        PostRequest request = new PostRequest("");

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/posts - nullの内容では400エラーが返される")
    void createPost_WithNullContent_ShouldReturnBadRequest() throws Exception {
        // Given
        PostRequest request = new PostRequest(null);

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/posts - 1000文字を超える内容では400エラーが返される")
    void createPost_WithTooLongContent_ShouldReturnBadRequest() throws Exception {
        // Given
        String longContent = "a".repeat(1001);
        PostRequest request = new PostRequest(longContent);

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/posts - 不正なJSONでは500エラーが返される")
    void createPost_WithInvalidJson_ShouldReturnInternalServerError() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("GET /api/posts/health - ヘルスチェックが正常に動作する")
    void health_ShouldReturnHealthStatus() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/posts/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.message", is("Minimum SNS Post App1 API is running")));
    }

    @Test
    @DisplayName("CORS設定が正しく動作する")
    void cors_ShouldAllowConfiguredOrigins() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/posts")
                .header("Origin", "http://localhost:3000")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    @DisplayName("OPTIONS リクエストでCORSプリフライトが処理される")
    void options_ShouldHandlePreflightRequest() throws Exception {
        // When & Then
        mockMvc.perform(options("/api/posts")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk());
    }
}
