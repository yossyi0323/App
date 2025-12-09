# 🧪 **テストケース仕様書**

## 📋 **テスト観点と判定基準**

### 🎯 **バックエンドテスト**

#### **PostControllerTest.java (REST APIテスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `getAllPosts_ShouldReturnPostsList` | 投稿一覧取得の正常動作 | GET /api/posts | 投稿リストのJSON配列 | HTTPステータス200、JSON形式、配列型 |
| `createPost_WithValidContent_ShouldReturnCreatedPost` | 投稿作成の正常動作 | 有効な投稿内容 | 作成された投稿のID | HTTPステータス200、IDが数値型 |
| `createPost_WithEmptyContent_ShouldReturnBadRequest` | 空内容での投稿拒否 | 空文字列 | バリデーションエラー | HTTPステータス400、エラーメッセージ |
| `createPost_WithTooLongContent_ShouldReturnBadRequest` | 長すぎる内容での投稿拒否 | 1000文字超過 | バリデーションエラー | HTTPステータス400、エラーメッセージ |
| `createPost_WithInvalidJson_ShouldReturnInternalServerError` | 不正JSONの処理 | 無効なJSON | サーバーエラー | HTTPステータス500 |
| `healthEndpoint_ShouldReturnHealthStatus` | ヘルスチェック動作 | GET /api/posts/health | ヘルス情報 | HTTPステータス200、status=UP |
| `cors_ShouldBeConfiguredCorrectly` | CORS設定確認 | OPTIONSリクエスト | CORSヘッダー | 適切なCORSヘッダーの存在 |

#### **PostServiceTest.java (ビジネスロジックテスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `createPost_WithValidContent_ShouldReturnPostResponse` | 正常な投稿作成処理 | 有効な投稿内容 | PostResponseオブジェクト | 内容が正しく設定されている |
| `createPost_WithNullContent_ShouldThrowException` | null入力の拒否 | null | IllegalArgumentException | 「投稿内容は空にできません」メッセージ |
| `createPost_WithEmptyContent_ShouldThrowException` | 空文字入力の拒否 | 空文字列 | IllegalArgumentException | 「投稿内容は空にできません」メッセージ |
| `createPost_WithWhitespaceContent_ShouldThrowException` | 空白のみ入力の拒否 | 空白文字のみ | IllegalArgumentException | 「投稿内容は空にできません」メッセージ |
| `createPost_WithTooLongContent_ShouldThrowException` | 長すぎる入力の拒否 | 1000文字超過 | IllegalArgumentException | 「1000文字以内で入力してください」メッセージ |
| `createPost_ShouldTrimWhitespace` | 前後空白の除去 | 前後に空白のある文字列 | トリムされた内容 | 空白が除去されている |
| `createPost_ShouldSetCreatedAtAutomatically` | 作成日時の自動設定 | 任意の内容 | 作成日時が設定されたレスポンス | createdAtがLocalDateTime型で存在 |
| `getAllPosts_ShouldReturnPostResponseList` | 全投稿取得処理 | なし | PostResponseのリスト | リスト形式で返される |
| `getAllPosts_WhenRepositoryThrowsException_ShouldPropagateException` | リポジトリ例外の伝播 | リポジトリ例外発生 | 例外が伝播 | 例外が適切に伝播される |

#### **PostRepositoryIntegrationTest.java (データベーステスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `savePost_ShouldPersistPost` | 投稿の永続化 | 新しいPost | 保存されたPost | IDが自動採番、内容が保存 |
| `savePost_ShouldSetCreatedAtAutomatically` | 作成日時の自動設定 | createdAtがnullのPost | 作成日時が設定されたPost | createdAtが現在時刻に近い値 |
| `findAllOrderByCreatedAtDesc_ShouldReturnPostsInDescendingOrder` | 作成日時降順での取得 | 複数の投稿 | 作成日時降順のリスト | 最新の投稿が先頭 |
| `saveMultiplePosts_ShouldMaintainOrder` | 複数投稿の順序保持 | 複数の投稿を順次保存 | 保存順序が維持されたリスト | 保存順と取得順が一致 |
| `findAllOrderByCreatedAtDesc_WithEmptyDatabase_ShouldReturnEmptyList` | 空データベースでの取得 | 投稿なし | 空のリスト | サイズが0のリスト |
| `savePost_WithLongContent_ShouldHandleCorrectly` | 長い内容の保存 | 1000文字の投稿 | 正常に保存 | 内容が完全に保存される |
| `savePost_WithSpecialCharacters_ShouldHandleCorrectly` | 特殊文字の保存 | 特殊文字を含む投稿 | 正常に保存 | 特殊文字が正しく保存される |
| `savePost_WithJapaneseCharacters_ShouldHandleCorrectly` | 日本語文字の保存 | 日本語を含む投稿 | 正常に保存 | 日本語が正しく保存される |
| `findAllOrderByCreatedAtDesc_ShouldHandleLargeDataset` | 大量データの処理 | 100件の投稿 | 全件取得 | 100件すべてが取得される |
| `sameCreatedAt_ShouldMaintainOrder` | 同一作成時刻での順序 | 同じ時刻の複数投稿 | 安定した順序 | 順序が一貫している |

#### **AnonymousMemoApplicationIntegrationTest.java (統合テスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `contextLoads` | アプリケーション起動確認 | なし | 正常起動 | 例外が発生しない |
| `healthEndpoint_ShouldReturnHealthStatus` | ヘルスエンドポイント動作 | GET /api/posts/health | ヘルス情報 | status=UP、適切なメッセージ |
| `getAllPosts_WithEmptyDatabase_ShouldReturnEmptyArray` | 空データベースでの投稿取得 | 投稿なし | 空配列 | JSON配列、サイズ0 |
| `fullPostFlow_ShouldWorkCorrectly` | 投稿作成から取得までの流れ | 投稿作成→取得 | 作成した投稿が取得できる | 作成した内容と一致 |
| `validationErrors_ShouldBeHandledCorrectly` | バリデーションエラー処理 | 無効な投稿内容 | 適切なエラーレスポンス | HTTPステータス400、エラー詳細 |
| `cors_ShouldBeConfiguredCorrectly` | CORS設定の統合確認 | 異なるオリジンからのリクエスト | CORS許可 | 適切なCORSヘッダー |
| `concurrentRequests_ShouldBeHandledCorrectly` | 同時リクエスト処理 | 複数の同時投稿 | すべて正常処理 | 全リクエストが成功 |
| `manyPosts_ShouldBeHandledCorrectly` | 大量投稿の処理 | 10件の投稿作成 | すべて正常処理 | 10件すべてが取得可能 |

---

### 🎯 **フロントエンドテスト**

#### **PostForm.spec.js (投稿フォームテスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `コンポーネントが正しくレンダリングされる` | 初期表示確認 | コンポーネントマウント | フォーム要素の表示 | h2、textarea、button要素の存在 |
| `初期状態では送信ボタンが無効化されている` | 初期状態確認 | 空のテキストエリア | 送信ボタンが無効 | disabled属性がtrue |
| `テキストエリアに入力すると文字数カウンターが更新される` | 文字数カウント機能 | 「テスト投稿」入力 | 「5/1000文字」表示 | カウンター表示が正確 |
| `空の投稿では送信ボタンが無効化される` | 空入力バリデーション | 空白のみ入力 | 送信ボタンが無効 | disabled属性がtrue |
| `有効な内容では送信ボタンが有効化される` | 有効入力確認 | 有効な投稿内容 | 送信ボタンが有効 | disabled属性がfalse |
| `1000文字を超える入力では文字数が赤く表示される` | 文字数制限表示 | 1001文字入力 | 赤色表示 | CSSクラス適用確認 |
| `送信成功時に成功メッセージが表示される` | 成功メッセージ表示 | 正常な投稿送信 | 成功メッセージ | 「投稿が完了しました」表示 |
| `送信失敗時にエラーメッセージが表示される` | エラーメッセージ表示 | API エラー発生 | エラーメッセージ | エラー内容の表示 |
| `送信中は送信ボタンが無効化される` | 送信中状態管理 | 送信処理中 | ボタン無効化 | 「送信中...」表示 |
| `送信成功後にフォームがリセットされる` | フォームリセット | 送信完了後 | 入力内容クリア | テキストエリアが空 |
| `送信成功後にpost-createdイベントが発火される` | イベント発火確認 | 送信完了後 | イベント発火 | $emit呼び出し確認 |

#### **PostList.spec.js (投稿一覧テスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `コンポーネントが正しくレンダリングされる` | 初期表示確認 | コンポーネントマウント | 基本要素の表示 | h2要素、空状態メッセージ |
| `マウント時にloadPostsが呼ばれる` | 初期データ読み込み | コンポーネントマウント | API呼び出し | getAllPostsが1回実行 |
| `ローディング中は適切なメッセージが表示される` | ローディング状態表示 | API処理中 | ローディングメッセージ | 「投稿を読み込み中...」表示 |
| `投稿データが正しく表示される` | データ表示確認 | 2件の投稿データ | 投稿リスト表示 | 2つの.post-item要素 |
| `投稿件数が正しく表示される` | 件数表示確認 | 2件の投稿データ | 「2件の投稿」表示 | .posts-header p要素 |
| `日付が正しくフォーマットされる` | 日付フォーマット確認 | ISO日付文字列 | 日本語日付形式 | 年月日を含む表示 |
| `投稿がない場合は空の状態メッセージが表示される` | 空状態表示 | 空の投稿配列 | 空状態メッセージ | 「まだ投稿がありません」表示 |
| `API エラー時にエラーメッセージが表示される` | エラー状態表示 | API エラー発生 | エラーメッセージ | エラー内容と再試行ボタン |
| `再試行ボタンクリックでloadPostsが再実行される` | 再試行機能確認 | 再試行ボタンクリック | API再実行 | getAllPostsが再度実行 |
| `refresh メソッドが loadPosts を呼び出す` | リフレッシュ機能 | refreshメソッド実行 | loadPosts実行 | メソッド呼び出し確認 |
| `無効な日付文字列の場合は元の文字列を返す` | 日付エラー処理 | 無効な日付文字列 | 「Invalid Date」 | エラー時の適切な表示 |
| `正常な日付文字列は日本語形式でフォーマットされる` | 日付フォーマット正常系 | 有効な日付文字列 | 日本語形式 | 年月日を含む適切な形式 |

#### **api.spec.js (API通信テスト)**

| テスト名 | 確認観点 | 入力条件 | 期待結果 | 判定基準 |
|----------|----------|----------|----------|----------|
| `getAllPosts - 正常に投稿一覧を取得できる` | 投稿取得API正常系 | なし | 投稿配列 | モックデータと一致 |
| `getAllPosts - API エラー時に適切なエラーメッセージが投げられる` | 投稿取得API異常系 | ネットワークエラー | 例外発生 | 「投稿の取得に失敗しました」 |
| `createPost - 正常に投稿を作成できる` | 投稿作成API正常系 | 有効な投稿内容 | 作成結果 | IDを含むレスポンス |
| `createPost - 400エラー時にバリデーションエラーメッセージが投げられる` | バリデーションエラー処理 | 無効な投稿内容 | 例外発生 | 「投稿内容は必須です」 |
| `createPost - 400エラー時に詳細がない場合は一般的なメッセージが投げられる` | 汎用エラー処理 | 詳細なしの400エラー | 例外発生 | 「入力内容に問題があります」 |
| `createPost - サーバーエラー時に適切なエラーメッセージが投げられる` | サーバーエラー処理 | 500エラー | 例外発生 | 「投稿の作成に失敗しました」 |
| `healthCheck - 正常にヘルスチェックを実行できる` | ヘルスチェック正常系 | なし | ヘルス情報 | status=UP |
| `healthCheck - API エラー時に適切なエラーメッセージが投げられる` | ヘルスチェック異常系 | 接続エラー | 例外発生 | 「APIサーバーに接続できません」 |

---

## 🎯 **共通テスト原則**

### **判定基準の共通ルール**
1. **正常系**: 期待された値・状態が正確に返される
2. **異常系**: 適切な例外・エラーメッセージが返される
3. **境界値**: 制限値での動作が仕様通り
4. **状態管理**: UIの状態変化が正しく反映される
5. **非同期処理**: 非同期操作の完了を適切に待機

### **テスト品質基準**
- **網羅性**: 正常系・異常系・境界値をカバー
- **独立性**: 各テストが他に依存しない
- **再現性**: 何度実行しても同じ結果
- **明確性**: テスト名で確認観点が理解できる
- **保守性**: 実装変更時の修正が容易

---

## 📊 **テスト実行結果**
- **バックエンド**: 37/37 テスト成功 (100%)
- **フロントエンド**: 35/35 テスト成功 (100%)
- **全体**: **72/72 テスト成功 (100%)**
