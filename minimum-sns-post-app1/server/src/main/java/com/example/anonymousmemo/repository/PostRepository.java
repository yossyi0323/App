package com.example.anonymousmemo.repository;

import com.example.anonymousmemo.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 投稿データアクセスリポジトリ
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * 投稿を作成日時の降順（新しい順）で取得
     * @return 投稿リスト
     */
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();
}
