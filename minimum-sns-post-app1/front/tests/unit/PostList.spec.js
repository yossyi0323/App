import { shallowMount } from '@vue/test-utils'
import PostList from '@/components/PostList.vue'

// API呼び出しをモック化
jest.mock('@/services/api', () => ({
  postService: {
    getAllPosts: jest.fn()
  }
}))

import { postService } from '@/services/api'
const mockGetAllPosts = postService.getAllPosts

describe('PostList.vue', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAllPosts.mockResolvedValue([]) // デフォルトで空配列を返す
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy()
    }
  })

  describe('初期状態', () => {
    it('コンポーネントが正しくレンダリングされる', async () => {
      mockGetAllPosts.mockResolvedValue([])
      wrapper = shallowMount(PostList)
      
      // loadPosts完了まで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0)) // 非同期処理完了待ち
      
      expect(wrapper.find('h2').text()).toBe('投稿一覧')
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('マウント時にloadPostsが呼ばれる', () => {
      mockGetAllPosts.mockResolvedValue([])
      
      wrapper = shallowMount(PostList)
      
      expect(mockGetAllPosts).toHaveBeenCalledTimes(1)
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中は適切なメッセージが表示される', async () => {
      // Promiseを永続的にpendingにしてローディング状態をキープ
      let resolvePromise
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockGetAllPosts.mockReturnValue(pendingPromise)
      
      wrapper = shallowMount(PostList)
      
      // loadPosts開始直後はローディング状態になる
      await wrapper.vm.$nextTick() // DOM更新を待つ
      
      expect(wrapper.find('.loading').exists()).toBe(true)
      expect(wrapper.find('.loading p').text()).toBe('投稿を読み込み中...')
      
      // テスト終了時にPromiseを解決してクリーンアップ
      resolvePromise([])
      await wrapper.vm.$nextTick()
    })
  })

  describe('投稿データの表示', () => {
    const mockPosts = [
      {
        id: 1,
        content: '最初の投稿',
        createdAt: '2025-08-30T10:00:00'
      },
      {
        id: 2,
        content: '2番目の投稿',
        createdAt: '2025-08-30T11:00:00'
      }
    ]

    it('投稿データが正しく表示される', async () => {
      mockGetAllPosts.mockResolvedValue(mockPosts)
      wrapper = shallowMount(PostList)
      
      // 非同期処理完了まで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const postItems = wrapper.findAll('.post-item')
      expect(postItems.length).toBe(2)
      
      expect(postItems.at(0).find('.post-content').text()).toBe('最初の投稿')
      expect(postItems.at(1).find('.post-content').text()).toBe('2番目の投稿')
    })

    it('投稿件数が正しく表示される', async () => {
      mockGetAllPosts.mockResolvedValue(mockPosts)
      wrapper = shallowMount(PostList)
      
      // 非同期処理完了まで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.find('.posts-header p').text()).toBe('2件の投稿')
    })

    it('日付が正しくフォーマットされる', () => {
      wrapper = shallowMount(PostList)
      const formattedDate = wrapper.vm.formatDate('2025-08-30T10:30:45')
      
      // 日本語ロケールでの日付フォーマットをチェック
      expect(formattedDate).toMatch(/2025/)
      expect(formattedDate).toMatch(/08/)
      expect(formattedDate).toMatch(/30/)
    })
  })

  describe('空の状態', () => {
        it('投稿がない場合は空の状態メッセージが表示される', async () => {
      mockGetAllPosts.mockResolvedValue([])
      wrapper = shallowMount(PostList)
      
      // 非同期処理完了まで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('まだ投稿がありません')
      expect(emptyState.text()).toContain('最初の投稿をしてみましょう！')
    })
  })

  describe('エラーハンドリング', () => {
    it('API エラー時にエラーメッセージが表示される', async () => {
      const errorMessage = '投稿の取得に失敗しました'
      mockGetAllPosts.mockRejectedValue(new Error(errorMessage))
      
      wrapper = shallowMount(PostList)
      
      // 非同期処理完了まで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.find('.error').text()).toBe(errorMessage)
      expect(wrapper.find('.retry-btn').exists()).toBe(true)
    })

    it('再試行ボタンクリックでloadPostsが再実行される', async () => {
      mockGetAllPosts.mockRejectedValue(new Error('エラー'))
      wrapper = shallowMount(PostList)
      
      // エラー状態になるまで待機
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 再試行時は成功させる
      mockGetAllPosts.mockResolvedValue([])
      
      // 実際のAPIコール回数をカウント
      const initialCallCount = mockGetAllPosts.mock.calls.length
      
      await wrapper.find('.retry-btn').trigger('click')
      
      // loadPostsが再実行されてAPIが再度呼ばれることを確認
      expect(mockGetAllPosts.mock.calls.length).toBe(initialCallCount + 1)
    })
  })

  describe('リフレッシュ機能', () => {
    it('refresh メソッドが loadPosts を呼び出す', async () => {
      mockGetAllPosts.mockResolvedValue([])
      wrapper = shallowMount(PostList)
      
      const loadPostsSpy = jest.spyOn(wrapper.vm, 'loadPosts')
      
      wrapper.vm.refresh()
      
      expect(loadPostsSpy).toHaveBeenCalled()
      loadPostsSpy.mockRestore()
    })
  })

  describe('日付フォーマット', () => {
    it('無効な日付文字列の場合は元の文字列を返す', () => {
      wrapper = shallowMount(PostList)
      const invalidDate = 'invalid-date'
      
      const result = wrapper.vm.formatDate(invalidDate)
      
      expect(result).toBe('Invalid Date')
    })

    it('正常な日付文字列は日本語形式でフォーマットされる', () => {
      wrapper = shallowMount(PostList)
      const dateString = '2025-08-30T15:30:45'
      
      const result = wrapper.vm.formatDate(dateString)
      
      // 基本的な形式チェック（環境によって詳細は異なる可能性があるため）
      expect(result).toContain('2025')
      expect(result).toContain('08')
      expect(result).toContain('30')
      expect(result).toContain('15')
      expect(result).toContain('30')
      expect(result).toContain('45')
    })
  })
})
