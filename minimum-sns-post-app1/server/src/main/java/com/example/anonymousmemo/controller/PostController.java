package com.example.anonymousmemo.controller;

import com.example.anonymousmemo.dto.PostRequest;
import com.example.anonymousmemo.dto.PostResponse;
import com.example.anonymousmemo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 投稿REST APIコントローラー
 */
@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"})
@Validated
public class PostController {
    
    private final PostService postService;
    
    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }
    
    /**
     * すべての投稿を取得
     * GET /api/posts
     * @return 投稿リスト
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
    
    /**
     * 新しい投稿を作成
     * POST /api/posts
     * @param request 投稿作成リクエスト
     * @return 作成された投稿のID
     */
    @PostMapping
    public ResponseEntity<Map<String, Long>> createPost(@Valid @RequestBody PostRequest request) {
        PostResponse createdPost = postService.createPost(request);
        
        // 仕様に従ってIDのみを返す
        Map<String, Long> response = Map.of("id", createdPost.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * ヘルスチェック用エンドポイント
     * GET /api/posts/health
     * @return ヘルスチェック結果
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = Map.of(
                "status", "UP",
                "message", "Minimum SNS Post App1 API is running"
        );
        return ResponseEntity.ok(response);
    }
}
