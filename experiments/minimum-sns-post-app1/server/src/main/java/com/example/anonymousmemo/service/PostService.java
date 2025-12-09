package com.example.anonymousmemo.service;

import com.example.anonymousmemo.dto.PostRequest;
import com.example.anonymousmemo.dto.PostResponse;
import com.example.anonymousmemo.entity.Post;
import com.example.anonymousmemo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 投稿サービスクラス
 */
@Service
@Transactional
public class PostService {
    
    private final PostRepository postRepository;
    
    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
    
    /**
     * すべての投稿を取得（新しい順）
     * @return 投稿レスポンスリスト
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllOrderByCreatedAtDesc();
        return posts.stream()
                .map(PostResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 新しい投稿を作成
     * @param request 投稿作成リクエスト
     * @return 作成された投稿のレスポンス
     * @throws IllegalArgumentException 投稿内容が無効な場合
     */
    public PostResponse createPost(PostRequest request) {
        // サービス層でもバリデーション実行（防御的プログラミング）
        String content = request.getContent();
        
        // null チェック
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("投稿内容は空にできません");
        }
        
        // 長さチェック
        if (content.length() > 1000) {
            throw new IllegalArgumentException("投稿内容は1000文字以内で入力してください");
        }
        
        // 前後の空白を除去
        String trimmedContent = content.trim();
        
        Post post = new Post(trimmedContent);
        Post savedPost = postRepository.save(post);
        return PostResponse.from(savedPost);
    }
}
