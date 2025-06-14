// API呼び出し共通クライアント

export async function callApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (res.status === 401 || res.status === 403) {
      // 認証エラー時はログイン画面にリダイレクト
      window.location.href = '/login';
      throw new Error('認証が必要です');
    }
    if (res.status >= 500) {
      // サーバーエラーは共通メッセージ
      throw new Error('サーバーエラーが発生しました。しばらくしてから再度お試しください。');
    }
    if (!res.ok) {
      // その他のエラー
      const error = await res.text();
      throw new Error(error);
    }
    return res.json() as Promise<T>;
  } catch (err: any) {
    // ネットワークエラー等も一元管理
    throw new Error(err?.message || 'ネットワークエラーが発生しました');
  }
}
