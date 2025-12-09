import { Page } from '@playwright/test';

/**
 * ブラウザのコンソールログをキャプチャして出力する
 */
export function captureConsoleLog(page: Page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[Browser ${type.toUpperCase()}] ${text}`);
  });

  page.on('pageerror', error => {
    console.log(`[Browser ERROR] ${error.message}`);
    console.log(error.stack);
  });
}

/**
 * ネットワークエラーをキャプチャ
 */
export function captureNetworkErrors(page: Page) {
  page.on('requestfailed', request => {
    console.log(`[Network FAILED] ${request.method()} ${request.url()}`);
    console.log(`  Failure: ${request.failure()?.errorText}`);
  });
}

