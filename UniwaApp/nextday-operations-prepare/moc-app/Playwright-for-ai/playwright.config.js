// playwright.config.js - moc-app explorer configuration

import { defineConfig } from '@playwright/test';

export default defineConfig({
  
  testDir: './tests', 
  
  use: {
    baseURL: 'http://localhost:3000', 
    browserName: 'chromium', 
    
    timezoneId: 'Asia/Tokyo',
    locale: 'ja-JP',
    
    // スクリーンショットを常に撮る
    screenshot: 'on',
    
    // 動画も記録
    video: 'on',
  },
  
  // スクリーンショット・動画の保存先
  outputDir: './test-results',
  
});

