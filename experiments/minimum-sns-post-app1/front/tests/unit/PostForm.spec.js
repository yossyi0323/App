import { shallowMount } from '@vue/test-utils'
import PostForm from '@/components/PostForm.vue'
import { postService } from '@/services/api'

// API呼び出しをモック化
jest.mock('@/services/api', () => ({
  postService: {
    createPost: jest.fn()
  }
}))

describe('PostForm.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(PostForm)
    jest.clearAllMocks()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  describe('初期状態', () => {
    it('コンポーネントが正しくレンダリングされる', () => {
      expect(wrapper.find('h2').text()).toBe('新しい投稿')
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('投稿する')
    })

    it('初期値が正しく設定されている', () => {
      expect(wrapper.vm.content).toBe('')
      expect(wrapper.vm.isSubmitting).toBe(false)
      expect(wrapper.vm.errorMessage).toBe('')
      expect(wrapper.vm.successMessage).toBe('')
    })

    it('投稿ボタンが無効化されている', () => {
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('入力バリデーション', () => {
    it('テキストエリアに入力すると文字数カウンターが更新される', async () => {
      const textarea = wrapper.find('textarea')
      await textarea.setValue('テスト投稿')
      
      expect(wrapper.find('.char-count').text()).toBe('5/1000文字')
    })

    it('空の投稿では送信ボタンが無効化される', async () => {
      const textarea = wrapper.find('textarea')
      await textarea.setValue('   ')
      
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('内容がある場合は送信ボタンが有効化される', async () => {
      const textarea = wrapper.find('textarea')
      await textarea.setValue('有効な投稿内容')
      
      expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    })

    it('1000文字を超える入力は制限される', async () => {
      const longText = 'a'.repeat(1001)
      const textarea = wrapper.find('textarea')
      
      // textareaのmaxlength属性により制限される
      expect(textarea.attributes('maxlength')).toBe('1000')
    })
  })

  describe('投稿送信', () => {
    beforeEach(async () => {
      const textarea = wrapper.find('textarea')
      await textarea.setValue('テスト投稿')
    })

    it('正常な投稿送信が成功する', async () => {
      const mockResponse = { id: 1 }
      postService.createPost.mockResolvedValue(mockResponse)

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(postService.createPost).toHaveBeenCalledWith('テスト投稿')
      
      // 非同期処理の完了を待つ
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.successMessage).toBe('投稿が完了しました！')
      expect(wrapper.vm.content).toBe('')
      expect(wrapper.emitted('post-created')).toBeTruthy()
      expect(wrapper.emitted('post-created')[0][0]).toEqual(mockResponse)
    })

    it('API エラー時にエラーメッセージが表示される', async () => {
      const errorMessage = '投稿の作成に失敗しました'
      postService.createPost.mockRejectedValue(new Error(errorMessage))

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // 非同期処理の完了を待つ
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toBe(errorMessage)
      expect(wrapper.vm.successMessage).toBe('')
    })

    it('送信中はボタンが無効化され、テキストが変更される', async () => {
      // API呼び出しを遅延させる
      postService.createPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(wrapper.vm.isSubmitting).toBe(true)
      expect(wrapper.find('button').text()).toBe('送信中...')
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    })
  })

  describe('メッセージ表示', () => {
    it('エラーメッセージが表示される', async () => {
      await wrapper.setData({ errorMessage: 'エラーが発生しました' })
      
      const errorDiv = wrapper.find('.error')
      expect(errorDiv.exists()).toBe(true)
      expect(errorDiv.text()).toBe('エラーが発生しました')
    })

    it('成功メッセージが表示される', async () => {
      await wrapper.setData({ successMessage: '投稿が完了しました！' })
      
      const successDiv = wrapper.find('.success')
      expect(successDiv.exists()).toBe(true)
      expect(successDiv.text()).toBe('投稿が完了しました！')
    })
  })

  describe('メソッドテスト', () => {
    it('showError メソッドが正しく動作する', () => {
      wrapper.vm.showError('テストエラー')
      
      expect(wrapper.vm.errorMessage).toBe('テストエラー')
      expect(wrapper.vm.successMessage).toBe('')
    })

    it('showSuccess メソッドが正しく動作する', () => {
      wrapper.vm.showSuccess('成功メッセージ')
      
      expect(wrapper.vm.successMessage).toBe('成功メッセージ')
      expect(wrapper.vm.errorMessage).toBe('')
    })

    it('clearMessages メソッドが正しく動作する', () => {
      wrapper.vm.errorMessage = 'エラー'
      wrapper.vm.successMessage = '成功'
      
      wrapper.vm.clearMessages()
      
      expect(wrapper.vm.errorMessage).toBe('')
      expect(wrapper.vm.successMessage).toBe('')
    })
  })
})
