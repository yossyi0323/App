import Vue from 'vue'
import App from './App.vue'

// 本番環境でのVue.jsの開発者向けメッセージを無効化
Vue.config.productionTip = false

// グローバルエラーハンドラー
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)
  
  // 本番環境では適切なエラー報告サービスに送信することを推奨
  if (process.env.NODE_ENV === 'production') {
    // 例: Sentry.captureException(err)
  }
}

// Vueインスタンスを作成してマウント
new Vue({
  render: h => h(App),
}).$mount('#app')
