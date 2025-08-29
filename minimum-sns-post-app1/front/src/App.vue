<template>
  <div id="app">
    <div class="container">
      <h1>Minimum SNS Post App1</h1>
      
      <!-- 投稿フォーム -->
      <PostForm @post-created="onPostCreated" />
      
      <!-- 投稿リスト -->
      <PostList ref="postList" />
    </div>
  </div>
</template>

<script>
import PostForm from './components/PostForm.vue'
import PostList from './components/PostList.vue'

export default {
  name: 'App',
  components: {
    PostForm,
    PostList
  },
  methods: {
    /**
     * 投稿が作成された時の処理
     * @param {Object} createdPost 作成された投稿データ
     */
    onPostCreated(createdPost) {
      console.log('New post created:', createdPost)
      
      // 投稿リストを更新
      if (this.$refs.postList) {
        this.$refs.postList.refresh()
      }
    }
  },
  mounted() {
    // アプリケーション初期化時の処理
    console.log('Anonymous Memo App initialized')
  }
}
</script>

<style>
/* グローバルスタイルは既にindex.htmlに定義済み */

/* アプリケーション固有のスタイル */
#app {
  min-height: 100vh;
  padding-top: 20px;
  padding-bottom: 40px;
}

/* レスポンシブ対応の追加スタイル */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
}

/* アニメーション効果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* スクロールバーのカスタマイズ */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
