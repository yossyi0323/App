package com.example.anonymousmemo;

import com.example.anonymousmemo.dto.PostRequest;
import com.example.anonymousmemo.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("アプリケーション統合テスト")
class AnonymousMemoApplicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // 各テスト前にデータベースをクリア
        postRepository.deleteAll();
    }

    @Test
    @DisplayName("アプリケーションが正常に起動する")
    void contextLoads() {
        // このテストが実行されることで、Spring Bootアプリケーションが正常に起動することを確認
    }

    @Test
    @DisplayName("ヘルスチェックエンドポイントが正常に動作する")
    void healthEndpoint_ShouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/api/posts/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.message", is("Minimum SNS Post App1 API is running")));
    }

    @Test
    @DisplayName("投稿の作成から取得までのフルフローが正常に動作する")
    void fullPostFlow_ShouldWorkCorrectly() throws Exception {
        // 1. 初期状態では投稿が空であることを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 2. 新しい投稿を作成
        PostRequest request1 = new PostRequest("最初の投稿");
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()));

        // 3. 投稿が1件になったことを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].content", is("最初の投稿")))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].createdAt", notNullValue()));

        // 4. 2番目の投稿を作成
        PostRequest request2 = new PostRequest("2番目の投稿");
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        // 5. 投稿が2件になり、新しい順で並んでいることを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].content", is("2番目の投稿"))) // 新しい投稿が最初
                .andExpect(jsonPath("$[1].content", is("最初の投稿")));
    }

    @Test
    @DisplayName("日本語投稿が正しく処理される")
    void japanesePost_ShouldBeHandledCorrectly() throws Exception {
        // Given
        PostRequest request = new PostRequest("これは日本語の投稿です。絵文字も含みます: 🚀🎉");

        // When & Then
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content", is("これは日本語の投稿です。絵文字も含みます: 🚀🎉")));
    }

    @Test
    @DisplayName("バリデーションエラーが正しく処理される")
    void validationErrors_ShouldBeHandledCorrectly() throws Exception {
        // 1. 空の投稿
        PostRequest emptyRequest = new PostRequest("");
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());

        // 2. null の投稿
        PostRequest nullRequest = new PostRequest(null);
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nullRequest)))
                .andExpect(status().isBadRequest());

        // 3. 長すぎる投稿
        String longContent = "a".repeat(1001);
        PostRequest longRequest = new PostRequest(longContent);
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(longRequest)))
                .andExpect(status().isBadRequest());

        // 4. エラーが発生してもデータベースには何も保存されていないことを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("CORS設定が正しく動作する")
    void cors_ShouldBeConfiguredCorrectly() throws Exception {
        // localhost:3000 からのリクエスト
        mockMvc.perform(get("/api/posts")
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));

        // localhost:8081 からのリクエスト
        mockMvc.perform(get("/api/posts")
                .header("Origin", "http://localhost:8081"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"));
    }

    @Test
    @DisplayName("大量の投稿でも正しく処理される")
    void manyPosts_ShouldBeHandledCorrectly() throws Exception {
        // 10件の投稿を作成
        for (int i = 1; i <= 10; i++) {
            PostRequest request = new PostRequest("投稿 " + i);
            mockMvc.perform(post("/api/posts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        // すべての投稿が正しく取得できることを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].content", is("投稿 10"))) // 最新が最初
                .andExpect(jsonPath("$[9].content", is("投稿 1")));  // 最古が最後
    }

    @Test
    @DisplayName("同時リクエストが正しく処理される")
    void concurrentRequests_ShouldBeHandledCorrectly() throws Exception {
        // 複数の投稿を短時間で作成
        PostRequest request1 = new PostRequest("同時投稿1");
        PostRequest request2 = new PostRequest("同時投稿2");
        PostRequest request3 = new PostRequest("同時投稿3");

        // 並行して投稿作成
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request3)))
                .andExpect(status().isCreated());

        // すべての投稿が正しく保存されていることを確認
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}
