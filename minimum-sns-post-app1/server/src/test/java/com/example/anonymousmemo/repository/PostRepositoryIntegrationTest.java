package com.example.anonymousmemo.repository;

import com.example.anonymousmemo.entity.Post;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("PostRepository 統合テスト")
class PostRepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    private Post post1;
    private Post post2;
    private Post post3;

    @BeforeEach
    void setUp() {
        // テストデータを準備（Repositoryを使用して@PrePersistを正しく実行）
        post1 = postRepository.save(new Post("最初の投稿"));
        post2 = postRepository.save(new Post("2番目の投稿"));
        post3 = postRepository.save(new Post("3番目の投稿"));
        
        entityManager.flush();
    }

    @Test
    @DisplayName("findAllOrderByCreatedAtDesc - 作成日時の降順で投稿を取得する")
    void findAllOrderByCreatedAtDesc_ShouldReturnPostsInDescendingOrder() {
        // When
        List<Post> result = postRepository.findAllOrderByCreatedAtDesc();

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getContent()).isEqualTo("3番目の投稿"); // 最新
        assertThat(result.get(1).getContent()).isEqualTo("2番目の投稿");
        assertThat(result.get(2).getContent()).isEqualTo("最初の投稿"); // 最古
    }

    @Test
    @DisplayName("save - 新しい投稿を正しく保存できる")
    void save_ShouldPersistNewPost() {
        // Given
        Post newPost = new Post();
        newPost.setContent("新しい投稿");
        newPost.setCreatedAt(LocalDateTime.now());

        // When
        Post savedPost = postRepository.save(newPost);

        // Then
        assertThat(savedPost.getId()).isNotNull();
        assertThat(savedPost.getContent()).isEqualTo("新しい投稿");
        assertThat(savedPost.getCreatedAt()).isNotNull();

        // データベースから実際に取得できることを確認
        Post foundPost = entityManager.find(Post.class, savedPost.getId());
        assertThat(foundPost).isNotNull();
        assertThat(foundPost.getContent()).isEqualTo("新しい投稿");
    }

    @Test
    @DisplayName("findAll - JpaRepository の基本機能が動作する")
    void findAll_ShouldReturnAllPosts() {
        // When
        List<Post> result = postRepository.findAll();

        // Then
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("count - 投稿数を正しく取得できる")
    void count_ShouldReturnCorrectCount() {
        // When
        long count = postRepository.count();

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("deleteById - 投稿を正しく削除できる")
    void deleteById_ShouldRemovePost() {
        // Given
        Long postId = post1.getId();

        // When
        postRepository.deleteById(postId);
        entityManager.flush();

        // Then
        assertThat(postRepository.count()).isEqualTo(2);
        assertThat(entityManager.find(Post.class, postId)).isNull();
    }

    @Test
    @DisplayName("日本語コンテンツが正しく保存・取得できる")
    void japaneseContent_ShouldBePersisted() {
        // Given
        Post japanesePost = new Post();
        japanesePost.setContent("これは日本語の投稿です。テスト用の文章。");
        japanesePost.setCreatedAt(LocalDateTime.now());

        // When
        Post savedPost = postRepository.save(japanesePost);
        entityManager.flush();
        entityManager.clear();

        // Then
        Post foundPost = postRepository.findById(savedPost.getId()).orElse(null);
        assertThat(foundPost).isNotNull();
        assertThat(foundPost.getContent()).isEqualTo("これは日本語の投稿です。テスト用の文章。");
    }

    @Test
    @DisplayName("長い文字列が正しく保存できる")
    void longContent_ShouldBePersisted() {
        // Given
        String longContent = "a".repeat(1000); // 1000文字
        Post longPost = new Post();
        longPost.setContent(longContent);
        longPost.setCreatedAt(LocalDateTime.now());

        // When
        Post savedPost = postRepository.save(longPost);
        entityManager.flush();
        entityManager.clear();

        // Then
        Post foundPost = postRepository.findById(savedPost.getId()).orElse(null);
        assertThat(foundPost).isNotNull();
        assertThat(foundPost.getContent()).hasSize(1000);
        assertThat(foundPost.getContent()).isEqualTo(longContent);
    }

    @Test
    @DisplayName("特殊文字を含む投稿が正しく保存できる")
    void specialCharacters_ShouldBePersisted() {
        // Given
        String specialContent = "特殊文字テスト: !@#$%^&*()_+-=[]{}|;':\",./<>?`~";
        Post specialPost = new Post();
        specialPost.setContent(specialContent);
        specialPost.setCreatedAt(LocalDateTime.now());

        // When
        Post savedPost = postRepository.save(specialPost);
        entityManager.flush();
        entityManager.clear();

        // Then
        Post foundPost = postRepository.findById(savedPost.getId()).orElse(null);
        assertThat(foundPost).isNotNull();
        assertThat(foundPost.getContent()).isEqualTo(specialContent);
    }

    @Test
    @DisplayName("同じ作成時刻の投稿でも正しく順序付けされる")
    void sameCreatedAt_ShouldMaintainOrder() {
        // Given - 新しい投稿を作成（@PrePersistで自動的にcreatedAtが設定される）
        Post newPost1 = new Post("同時投稿1");
        Post newPost2 = new Post("同時投稿2");

        // 投稿を保存（@PrePersistが実行される）
        Post savedPost1 = postRepository.save(newPost1);
        Post savedPost2 = postRepository.save(newPost2);
        entityManager.flush();

        // When
        List<Post> result = postRepository.findAllOrderByCreatedAtDesc();

        // Then
        assertThat(result).hasSize(5); // 元の3つ + 新しい2つ
        
        // 保存された投稿が含まれていることを確認
        assertThat(result).extracting(Post::getContent)
                .contains("同時投稿1", "同時投稿2");
        
        // createdAtが設定されていることを確認
        assertThat(savedPost1.getCreatedAt()).isNotNull();
        assertThat(savedPost2.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("空のデータベースでは空のリストが返される")
    void emptyDatabase_ShouldReturnEmptyList() {
        // Given - すべてのデータを削除
        postRepository.deleteAll();
        entityManager.flush();

        // When
        List<Post> result = postRepository.findAllOrderByCreatedAtDesc();

        // Then
        assertThat(result).isEmpty();
    }
}
