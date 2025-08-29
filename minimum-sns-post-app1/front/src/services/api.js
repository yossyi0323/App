import axios from 'axios'

// APIのベースURL設定
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080'

// Axiosインスタンス作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 投稿API関連のサービス
 */
export const postService = {
  /**
   * すべての投稿を取得
   * @returns {Promise} 投稿リスト
   */
  async getAllPosts() {
    try {
      const response = await apiClient.get('/api/posts')
      return response.data
    } catch (error) {
      throw new Error('投稿の取得に失敗しました')
    }
  },

  /**
   * 新しい投稿を作成
   * @param {string} content 投稿内容
   * @returns {Promise} 作成結果
   */
  async createPost(content) {
    try {
      const response = await apiClient.post('/api/posts', { content })
      return response.data
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data
        if (errorData.details && errorData.details.content) {
          throw new Error(errorData.details.content)
        }
        throw new Error(errorData.message || '入力内容に問題があります')
      }
      throw new Error('投稿の作成に失敗しました')
    }
  },

  /**
   * APIヘルスチェック
   * @returns {Promise} ヘルスチェック結果
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/api/posts/health')
      return response.data
    } catch (error) {
      throw new Error('APIサーバーに接続できません')
    }
  }
}

export default postService
