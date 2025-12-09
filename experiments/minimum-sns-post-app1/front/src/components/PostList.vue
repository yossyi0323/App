<template>
  <div class="posts-list">
    <div class="posts-header">
      <h2>投稿一覧</h2>
      <p v-if="posts.length > 0">{{ posts.length }}件の投稿</p>
    </div>
    
    <!-- ローディング状態 -->
    <div v-if="isLoading" class="loading">
      <p>投稿を読み込み中...</p>
    </div>
    
    <!-- エラー状態 -->
    <div v-else-if="errorMessage" class="error-container">
      <div class="error">
        {{ errorMessage }}
      </div>
      <button @click="loadPosts" class="btn retry-btn">
        再試行
      </button>
    </div>
    
    <!-- 投稿が空の場合 -->
    <div v-else-if="posts.length === 0" class="empty-state">
      <p>まだ投稿がありません。</p>
      <p>最初の投稿をしてみましょう！</p>
    </div>
    
    <!-- 投稿リスト -->
    <div v-else>
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-item"
      >
        <div class="post-content">{{ post.content }}</div>
        <div class="post-date">{{ formatDate(post.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { postService } from '../services/api'

export default {
  name: 'PostList',
  data() {
    return {
      posts: [],
      isLoading: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.loadPosts()
  },
  methods: {
    async loadPosts() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        this.posts = await postService.getAllPosts()
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },

    // 外部から呼び出されるリフレッシュメソッド
    refresh() {
      this.loadPosts()
    }
  }
}
</script>

<style scoped>
.posts-header {
  text-align: center;
}

.posts-header h2 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.posts-header p {
  font-size: 0.9rem;
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.error-container {
  padding: 20px;
  text-align: center;
}

.retry-btn {
  margin-top: 15px;
  background-color: #e67e22;
}

.retry-btn:hover {
  background-color: #d35400;
}

.post-item {
  transition: background-color 0.2s ease;
}

.post-item:hover {
  background-color: #f8f9fa;
}

.post-content {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.post-date {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 10px;
}

.empty-state p:first-child {
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
