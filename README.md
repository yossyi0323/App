# App - 個人開発プロジェクト群

このディレクトリは、個人開発で作成するアプリケーション群を管理するためのルートディレクトリです。

## 1. ディレクトリ構成

```
App/
├── UniwaApp/                 # 飲食店向けアプリケーション
├── Tools/                    # 共通ツール・ライブラリ
├── Experiments/              # 一時的な実験用のアプリケーション
│   ├── drizzle-test/         # Drizzle ORM検証プロジェクト
│   ├── minimum-sns-post-app1/ # 匿名投稿SNSアプリ（Vue.js + Java）
│   ├── minimum-sns-post-app2/ # 匿名投稿SNSアプリ（Rust）
│   └── opensearch-dynamoDB-test/ # OpenSearch + DynamoDB検証
└── README.md                 # このファイル
```

## 2. プロジェクトカテゴリ

### 2.1. Tools：共通ツール・ライブラリ
アプリケーション開発を支援する独立したツール群です。

**特徴:**
- 完全な独立性と再利用性
- フレームワーク非依存設計
- NPMパッケージ化可能な構成

**現在のプロジェクト:**
- [`Tools/`](./Tools/) - 開発支援ツール群（準備中）

### 2.2. Docs：App直下のディレクトリに配置すべきドキュメント郡
- `Obsidian Vault\Notes\2 Work\2.3. エンジニア\個人開発\App`との棲み分けは要検討。
  - ドキュメントをObsidianに配置しているのは、ドキュメントのPC間の同期を取りやすく、かつ出先でもスマホで見れるため。
  - Docsディレクトリは、App直下にも設けることとする。
  - App配下の各ディレクトリや各アプリにも、それぞれの場所に合った内容のREADMEや/docsディレクトリを、必要に応じて配置し、ソースコードと近いところで仕様書のドキュメントをGit管理するものとする。

### 2.3. Experiments：実験用アプリケーション
技術検証や一時的な実験目的で作成したアプリケーション群です。

**特徴:**
- 技術探求・学習が主目的
- 自由な技術選定とアーキテクチャ実験
- 今後も育てていく予定のない一時的なプロジェクト

**現在のプロジェクト:**
- [`Experiments/drizzle-test/`](./Experiments/drizzle-test/) - Drizzle ORM検証プロジェクト
- [`Experiments/minimum-sns-post-app1/`](./Experiments/minimum-sns-post-app1/) - 匿名投稿SNSアプリ（Vue.js + Java Spring Boot + PostgreSQL）
- [`Experiments/minimum-sns-post-app2/`](./Experiments/minimum-sns-post-app2/) - 匿名投稿SNSアプリ（Rust）
- [`Experiments/opensearch-dynamoDB-test/`](./Experiments/opensearch-dynamoDB-test/) - OpenSearch + DynamoDB検証

### 2.4. UniwaApp：飲食店向けアプリケーション
実際の飲食店業務を効率化するためのアプリケーション群です。

**特徴:**
- リアルなユーザーと業務を対象
- 実用性と業務適合性を重視
- 大規模システム設計の学習機会

**現在のプロジェクト:**
- [`UniwaApp/operations-prepare/`](./UniwaApp/operations-prepare/) - 営業準備支援アプリ（Next.js + TypeScript + Supabase）

## 3. アーキテクチャ方針

### 3.1. マイクロサービス志向のモノレポ
- **疎結合**: アプリ間はAPI経由での連携のみで、密結合にしない
- **再利用性**: 共通機能は独立したパッケージとして管理
- **独立デプロイ**: アプリごとに独立したデプロイが可能

### 3.2. 設計原則
- **データ中心設計**: DBの状態がアプリケーション挙動を決定
- **共通機能の分離**: UI、認証、ユーティリティの共通化。Toolsに集約する、自作ライブラリ作成を検討するなど。

## 4. 📚 学習目標

### 4.1. 大規模システム開発への応用
- **ドメイン駆動設計（DDD）**: ビジネスドメインのモデル化
- **API設計**: RESTful API、GraphQLの設計原則
- **分散システム**: マイクロサービス、イベント駆動アーキテクチャ
- **データ整合性**: トランザクション管理、結果整合性

### 4.2. 運用・保守の実践
- **CI/CD**: 自動テスト、デプロイパイプライン
- **監視**: アプリケーション監視、ログ管理
- **セキュリティ**: 認証・認可、データ保護

## 5. 開発環境

### 5.1. 必要なツール
- **Node.js** 18以上
- **PostgreSQL** 14以上
- **Docker** & **Docker Compose**
- **Git**

### 5.2. 推奨IDE
- **Cursor** (AI支援付きコードエディタ)
- **VS Code** + 関連拡張機能

## 6. 各プロジェクトの詳細

各プロジェクトの詳細な情報は、それぞれのディレクトリ内のREADMEを参照してください：

- [UniwaApp/operations-prepare ドキュメント](./UniwaApp/operations-prepare/docs/)
- [Tools README](./Tools/README.md)
- [Experiments/minimum-sns-post-app1 README](./Experiments/minimum-sns-post-app1/README.md)

## 7. 学習リソース

### 7.1. 参考資料
- [Future株式会社 アーキテクチャガイドライン](https://future-architect.github.io/arch-guidelines/)
  - 私がFuture株式会社に勤めているため、このガイドラインをより優先的に参考にしたい
- [Next.js公式ドキュメント](https://nextjs.org/docs)

## 8. コントリビューション

このプロジェクト群は個人開発プロジェクトですが、以下の方針で進めています：

- **コード品質**: 企業レベルの品質基準を維持
- **ドキュメント**: 設計思想と実装詳細を記録
- **テスト**: 包括的なテストカバレッジ
- **セキュリティ**: 本番運用を想定したセキュリティ対策

---

**個人開発を通じて、大規模システム開発の知見を深め、実践的なスキルを習得することを目指しています。**
