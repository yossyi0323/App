# バックエンドアーキテクチャ

## 1. 全体構成

```
src/main/java/com/uniwaapp/nextdayops/
├── controller/        # リクエスト/レスポンスの制御
├── service/          # ビジネスロジック
├── repository/       # JPAリポジトリインターフェース
├── entity/          # データモデル（JPAエンティティ）
├── dto/             # データ転送オブジェクト
├── config/          # アプリケーション設定
└── utils/           # ユーティリティクラス
```

## 2. 各レイヤーの役割

### 2.1 Controller層

- **役割**: HTTPリクエストの受信とレスポンスの送信
- **主な責務**:
  - リクエストパラメータのバリデーション
  - 適切なServiceの呼び出し
  - レスポンスの生成とステータスコードの設定
- **主要クラス**:
  - `ReservationController`: 予約関連のAPIエンドポイント
  - `HomeController`: ホーム画面関連のAPIエンドポイント
  - `InventoryConfirmationController`: 在庫確認関連のAPIエンドポイント

### 2.2 Service層

- **役割**: ビジネスロジックの実装
- **主な責務**:
  - トランザクション管理
  - 複数のRepositoryの連携
  - ビジネスルールの適用
  - 自動保存機能の実装
- **主要クラス**:
  - `ReservationService`: 予約関連のビジネスロジック
  - `InventoryConfirmationService`: 在庫確認関連のビジネスロジック

### 2.3 Repository層

- **役割**: JPAを使用したデータアクセス
- **主な責務**:
  - データアクセス操作の抽象化
  - JPAエンティティの永続化
- **主要クラス**:
  - 予約関連: `ReservationRepository`, `ReservationStatusRepository`
  - 在庫関連: `InventoryConfirmationRepository`, `InventoryStatusRepository`
  - 商品関連: `ItemRepository`, `ItemReplenishmentRepository`, `ItemPreparationRepository`
  - 場所関連: `LocationRepository`, `PlaceRepository`, `LocationRelationRepository`

### 2.4 Entity層

- **役割**: JPAエンティティの定義
- **主な責務**:
  - データベーステーブルとのマッピング
  - ドメインモデルの表現
- **基底クラス**:
  - `BaseEntity`: 共通の属性（作成日時、更新日時など）
  - `FrontendGeneratedIdEntity`: フロントエンドで生成されるUUID v7を使用
  - `BackendGeneratedIdEntity`: バックエンドで生成されるIDを使用
- **主要エンティティ**:
  - 予約関連: `Reservation`, `ReservationStatus`
  - 在庫関連: `InventoryConfirmation`, `InventoryStatus`
  - 商品関連: `Item`, `ItemReplenishment`, `ItemPreparation`
  - 場所関連: `Location`, `Place`, `LocationRelation`

## 3. データフロー

1. **リクエスト受信**

   ```
   HTTPリクエスト → Controller → Service → Repository → データベース
   ```

2. **レスポンス生成**
   ```
   データベース → Repository → Service → Controller → HTTPレスポンス
   ```

## 4. 主要なテーブルとエンティティ

### 4.1 予約関連

- **テーブル**: `reservation`, `reservation_status`
- **エンティティ**: `Reservation`, `ReservationStatus`
- **用途**: 商品予約情報の管理
- **特徴**:
  - UUID v7を使用したID生成
  - 自動保存機能の実装
  - 予約状況のステータス管理

### 4.2 在庫関連

- **テーブル**: `inventory_confirmation`, `inventory_status`
- **エンティティ**: `InventoryConfirmation`, `InventoryStatus`
- **用途**: 在庫状況の管理
- **特徴**:
  - 在庫確認と在庫状況の分離
  - 自動保存機能の実装

### 4.3 商品関連

- **テーブル**: `item`, `item_replenishment`, `item_preparation`
- **エンティティ**: `Item`, `ItemReplenishment`, `ItemPreparation`
- **用途**: 商品情報と補充・準備状況の管理
- **特徴**:
  - 商品の基本情報管理
  - 補充と準備のワークフロー管理

### 4.4 場所関連

- **テーブル**: `location`, `place`, `location_relation`
- **エンティティ**: `Location`, `Place`, `LocationRelation`
- **用途**: 場所情報と関連性の管理
- **特徴**:
  - 場所の階層構造管理
  - 多対多の関連性管理

## 5. トランザクション管理

- **Service層**で`@Transactional`アノテーションを使用
- デフォルトで`REQUIRED`伝播動作
- ロールバックは`RuntimeException`発生時

## 6. エラーハンドリング

- **Controller層**で例外を捕捉
- 適切なHTTPステータスコードを返却
- エラーログの出力

## 7. セキュリティ考慮事項

- 入力値のバリデーション
- 適切なアクセス制御
- 自動保存時のデータ整合性チェック
