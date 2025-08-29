<template>
  <div class="post-form">
    <h2>新しい投稿</h2>
    
    <!-- エラーメッセージ -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
    
    <!-- 成功メッセージ -->
    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="submitPost">
      <div class="form-group">
        <label for="content">投稿内容:</label>
        <textarea
          id="content"
          v-model="content"
          placeholder="何か書いてください..."
          :disabled="isSubmitting"
          maxlength="1000"
        ></textarea>
        <div class="char-count">
          {{ content.length }}/1000文字
        </div>
      </div>
      
      <button 
        type="submit" 
        class="btn"
        :disabled="isSubmitting || !content.trim()"
      >
        {{ isSubmitting ? '送信中...' : '投稿する' }}
      </button>
    </form>
  </div>
</template>

<script>
import { postService } from '../services/api'

export default {
  name: 'PostForm',
  data() {
    return {
      content: '',
      isSubmitting: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async submitPost() {
      // バリデーション
      if (!this.content.trim()) {
        this.showError('投稿内容を入力してください')
        return
      }

      if (this.content.length > 1000) {
        this.showError('投稿内容は1000文字以内で入力してください')
        return
      }

      this.isSubmitting = true
      this.clearMessages()

      try {
        // API呼び出し
        const result = await postService.createPost(this.content.trim())
        
        // 成功処理
        this.showSuccess('投稿が完了しました！')
        this.content = ''
        
        // 親コンポーネントに投稿完了を通知
        this.$emit('post-created', result)
        
      } catch (error) {
        this.showError(error.message)
      } finally {
        this.isSubmitting = false
      }
    },

    showError(message) {
      this.errorMessage = message
      this.successMessage = ''
      // 3秒後にエラーメッセージを消す
      setTimeout(() => {
        this.errorMessage = ''
      }, 3000)
    },

    showSuccess(message) {
      this.successMessage = message
      this.errorMessage = ''
      // 2秒後に成功メッセージを消す
      setTimeout(() => {
        this.successMessage = ''
      }, 2000)
    },

    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    }
  }
}
</script>

<style scoped>
.post-form h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.char-count {
  text-align: right;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 5px;
}

.error {
  animation: fadeIn 0.3s ease-in;
}

.success {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
