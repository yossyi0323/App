package com.example.anonymousmemo.service;

import com.example.anonymousmemo.dto.PostRequest;
import com.example.anonymousmemo.dto.PostResponse;
import com.example.anonymousmemo.entity.Post;
import com.example.anonymousmemo.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostService のテスト")
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostService postService;

    private Post samplePost1;
    private Post samplePost2;

    @BeforeEach
    void setUp() {
        samplePost1 = new Post();
        samplePost1.setId(1L);
        samplePost1.setContent("テスト投稿1");
        samplePost1.setCreatedAt(LocalDateTime.of(2025, 8, 30, 10, 0, 0));

        samplePost2 = new Post();
        samplePost2.setId(2L);
        samplePost2.setContent("テスト投稿2");
        samplePost2.setCreatedAt(LocalDateTime.of(2025, 8, 30, 11, 0, 0));
    }

    @Test
    @DisplayName("getAllPosts - すべての投稿を正しく取得できる")
    void getAllPosts_ShouldReturnAllPostsOrderedByCreatedAtDesc() {
        // Given
        List<Post> posts = Arrays.asList(samplePost2, samplePost1); // 新しい順
        when(postRepository.findAllOrderByCreatedAtDesc()).thenReturn(posts);

        // When
        List<PostResponse> result = postService.getAllPosts();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(2L);
        assertThat(result.get(0).getContent()).isEqualTo("テスト投稿2");
        assertThat(result.get(1).getId()).isEqualTo(1L);
        assertThat(result.get(1).getContent()).isEqualTo("テスト投稿1");

        verify(postRepository, times(1)).findAllOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("getAllPosts - 投稿がない場合は空のリストを返す")
    void getAllPosts_WhenEmpty_ShouldReturnEmptyList() {
        // Given
        when(postRepository.findAllOrderByCreatedAtDesc()).thenReturn(Arrays.asList());

        // When
        List<PostResponse> result = postService.getAllPosts();

        // Then
        assertThat(result).isEmpty();
        verify(postRepository, times(1)).findAllOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("createPost - 正常な投稿作成が成功する")
    void createPost_WithValidRequest_ShouldCreateAndReturnPost() {
        // Given
        PostRequest request = new PostRequest("新しい投稿内容");
        Post savedPost = new Post();
        savedPost.setId(1L);
        savedPost.setContent("新しい投稿内容");
        savedPost.setCreatedAt(LocalDateTime.now());

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        // When
        PostResponse result = postService.createPost(request);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getContent()).isEqualTo("新しい投稿内容");
        assertThat(result.getCreatedAt()).isNotNull();

        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    @DisplayName("createPost - 空白文字のみの投稿は例外が発生する")
    void createPost_WithBlankContent_ShouldThrowException() {
        // Given
        PostRequest request = new PostRequest("   ");

        // When & Then
        assertThatThrownBy(() -> postService.createPost(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("投稿内容は空にできません");

        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    @DisplayName("createPost - null の投稿は例外が発生する")
    void createPost_WithNullContent_ShouldThrowException() {
        // Given
        PostRequest request = new PostRequest(null);

        // When & Then
        assertThatThrownBy(() -> postService.createPost(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("投稿内容は空にできません");

        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    @DisplayName("createPost - 1000文字を超える投稿は例外が発生する")
    void createPost_WithTooLongContent_ShouldThrowException() {
        // Given
        String longContent = "a".repeat(1001);
        PostRequest request = new PostRequest(longContent);

        // When & Then
        assertThatThrownBy(() -> postService.createPost(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("投稿内容は1000文字以内で入力してください");

        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    @DisplayName("createPost - 投稿内容の前後の空白が除去される")
    void createPost_ShouldTrimContent() {
        // Given
        PostRequest request = new PostRequest("  投稿内容  ");
        Post savedPost = new Post();
        savedPost.setId(1L);
        savedPost.setContent("投稿内容");
        savedPost.setCreatedAt(LocalDateTime.now());

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        // When
        PostResponse result = postService.createPost(request);

        // Then
        assertThat(result.getContent()).isEqualTo("投稿内容");

        // save メソッドに渡された Post オブジェクトの検証
        verify(postRepository).save(argThat(post -> 
            post.getContent().equals("投稿内容")
        ));
    }

    @Test
    @DisplayName("createPost - 作成時刻が自動設定される")
    void createPost_ShouldSetCreatedAtAutomatically() {
        // Given
        PostRequest request = new PostRequest("テスト投稿");
        
        Post savedPost = new Post();
        savedPost.setId(1L);
        savedPost.setContent("テスト投稿");
        savedPost.setCreatedAt(LocalDateTime.now()); // タイムスタンプが設定されている

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        // When
        PostResponse result = postService.createPost(request);

        // Then - データ型の存在のみをテスト（具体的な値は検証しない）
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getCreatedAt()).isInstanceOf(LocalDateTime.class);
        
        // save メソッドが呼び出されることを確認（createdAtは@PrePersistで設定されるため、save時はnull）
        verify(postRepository).save(argThat(post -> 
            post.getContent().equals("テスト投稿") && post.getCreatedAt() == null
        ));
    }

    @Test
    @DisplayName("PostResponse への変換が正しく行われる")
    void convertToPostResponse_ShouldMapAllFields() {
        // Given
        Post post = new Post();
        post.setId(100L);
        post.setContent("変換テスト投稿");
        post.setCreatedAt(LocalDateTime.of(2025, 8, 30, 15, 30, 45));

        when(postRepository.findAllOrderByCreatedAtDesc()).thenReturn(Arrays.asList(post));

        // When
        List<PostResponse> result = postService.getAllPosts();

        // Then
        assertThat(result).hasSize(1);
        PostResponse response = result.get(0);
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getContent()).isEqualTo("変換テスト投稿");
        assertThat(response.getCreatedAt()).isEqualTo(LocalDateTime.of(2025, 8, 30, 15, 30, 45));
    }
}
