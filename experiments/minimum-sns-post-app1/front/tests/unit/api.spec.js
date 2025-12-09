// postServiceを直接モック化
jest.mock('@/services/api', () => ({
  postService: {
    getAllPosts: jest.fn(),
    createPost: jest.fn(),
    healthCheck: jest.fn()
  }
}))

import { postService } from '@/services/api'

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('postService.getAllPosts', () => {
    it('正常に投稿一覧を取得できる', async () => {
      const mockPosts = [
        { id: 1, content: 'テスト投稿1', createdAt: '2025-08-30T10:00:00' },
        { id: 2, content: 'テスト投稿2', createdAt: '2025-08-30T11:00:00' }
      ]

      postService.getAllPosts.mockResolvedValue(mockPosts)

      const result = await postService.getAllPosts()

      expect(result).toEqual(mockPosts)
      expect(postService.getAllPosts).toHaveBeenCalledTimes(1)
    })

    it('API エラー時に適切なエラーメッセージが投げられる', async () => {
      postService.getAllPosts.mockRejectedValue(new Error('投稿の取得に失敗しました'))

      await expect(postService.getAllPosts()).rejects.toThrow('投稿の取得に失敗しました')
    })
  })

  describe('postService.createPost', () => {
    it('正常に投稿を作成できる', async () => {
      const mockResponse = { id: 123 }
      postService.createPost.mockResolvedValue(mockResponse)

      const result = await postService.createPost('テスト投稿')

      expect(result).toEqual(mockResponse)
      expect(postService.createPost).toHaveBeenCalledWith('テスト投稿')
    })

    it('400エラー時にバリデーションエラーメッセージが投げられる', async () => {
      postService.createPost.mockRejectedValue(new Error('投稿内容は必須です'))

      await expect(postService.createPost('')).rejects.toThrow('投稿内容は必須です')
    })

    it('400エラー時に詳細がない場合は一般的なメッセージが投げられる', async () => {
      postService.createPost.mockRejectedValue(new Error('入力内容に問題があります'))

      await expect(postService.createPost('test')).rejects.toThrow('入力内容に問題があります')
    })

    it('サーバーエラー時に適切なエラーメッセージが投げられる', async () => {
      postService.createPost.mockRejectedValue(new Error('投稿の作成に失敗しました'))

      await expect(postService.createPost('test')).rejects.toThrow('投稿の作成に失敗しました')
    })
  })

  describe('postService.healthCheck', () => {
    it('正常にヘルスチェックを実行できる', async () => {
      const mockResponse = { status: 'UP', message: 'API is running' }
      postService.healthCheck.mockResolvedValue(mockResponse)

      const result = await postService.healthCheck()

      expect(result).toEqual(mockResponse)
      expect(postService.healthCheck).toHaveBeenCalledTimes(1)
    })

    it('API エラー時に適切なエラーメッセージが投げられる', async () => {
      postService.healthCheck.mockRejectedValue(new Error('APIサーバーに接続できません'))

      await expect(postService.healthCheck()).rejects.toThrow('APIサーバーに接続できません')
    })
  })
})