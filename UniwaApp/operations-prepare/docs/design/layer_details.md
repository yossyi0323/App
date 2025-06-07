# レイヤー詳細

## 1. Controller層

### 1.1 役割と責務
- HTTPリクエストの受信とレスポンスの送信
- リクエストパラメータのバリデーション
- 適切なServiceの呼び出し
- レスポンスの生成とステータスコードの設定

### 1.2 主要クラスと実装例

#### ReservationController
```java
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    @GetMapping("/{businessDate}")
    public ResponseEntity<DailyReservation> getReservations(
        @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate businessDate) {
        return ResponseEntity.ok(reservationService.findByBusinessDate(businessDate));
    }

    @PostMapping
    public ResponseEntity<DailyReservation> saveReservations(
        @RequestBody @Valid DailyReservation reservation) {
        return ResponseEntity.ok(reservationService.save(reservation));
    }
}
```

#### InventoryConfirmationController
```java
@RestController
@RequestMapping("/api/inventory-confirmations")
public class InventoryConfirmationController {
    private final InventoryConfirmationService inventoryConfirmationService;

    @GetMapping("/{businessDate}")
    public ResponseEntity<List<InventoryConfirmation>> getInventoryConfirmations(
        @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate businessDate) {
        return ResponseEntity.ok(inventoryConfirmationService.findByBusinessDate(businessDate));
    }
}
```

### 1.3 ベストプラクティス
- 適切なHTTPメソッドの使用
- リクエストパラメータのバリデーション
- 適切なエラーハンドリング
- レスポンスの一貫性保持

## 2. Service層

### 2.1 役割と責務
- ビジネスロジックの実装
- トランザクション管理
- 複数のRepositoryの連携
- ビジネスルールの適用
- 自動保存機能の実装

### 2.2 主要クラスと実装例

#### ReservationService
```java
@Service
@Transactional
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final ReservationStatusRepository statusRepository;

    public DailyReservation findByBusinessDate(LocalDate businessDate) {
        List<Reservation> reservations = reservationRepository.findByBusinessDate(businessDate);
        ReservationStatus status = statusRepository.findByBusinessDate(businessDate)
            .orElse(new ReservationStatus(businessDate));
        return new DailyReservation(businessDate, status.getMemo(), reservations);
    }

    public DailyReservation save(DailyReservation reservation) {
        // 予約情報の保存
        List<Reservation> savedReservations = reservationRepository.saveAll(reservation.getReservations());
        
        // 予約状況の更新
        ReservationStatus status = statusRepository.findByBusinessDate(reservation.getBusinessDate())
            .orElse(new ReservationStatus(reservation.getBusinessDate()));
        status.setMemo(reservation.getMemo());
        statusRepository.save(status);
        
        return new DailyReservation(reservation.getBusinessDate(), status.getMemo(), savedReservations);
    }
}
```

### 2.3 ベストプラクティス
- トランザクション境界の適切な設定
- ビジネスロジックの分離
- エラーハンドリングの実装
- ログ出力の適切な実装

## 3. Repository層

### 3.1 役割と責務
- JPAを使用したデータアクセス
- データアクセス操作の抽象化
- JPAエンティティの永続化

### 3.2 主要クラスと実装例

#### ReservationRepository
```java
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByBusinessDate(LocalDate businessDate);
    
    @Modifying
    @Query("DELETE FROM Reservation r WHERE r.businessDate = :businessDate")
    void deleteByBusinessDate(@Param("businessDate") LocalDate businessDate);
}
```

#### ReservationStatusRepository
```java
@Repository
public interface ReservationStatusRepository extends JpaRepository<ReservationStatus, LocalDate> {
    Optional<ReservationStatus> findByBusinessDate(LocalDate businessDate);
}
```

### 3.3 ベストプラクティス
- 適切なクエリメソッドの命名
- パフォーマンスを考慮したクエリ設計
- トランザクション境界の理解
- キャッシュ戦略の検討

## 4. Entity層

### 4.1 役割と責務
- JPAエンティティの定義
- データベーステーブルとのマッピング
- ドメインモデルの表現

### 4.2 基底クラス

#### BaseEntity
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### FrontendGeneratedIdEntity
```java
@MappedSuperclass
public abstract class FrontendGeneratedIdEntity extends BaseEntity {
    @Id
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;
    
    protected FrontendGeneratedIdEntity() {
        this.id = UUID.randomUUID();
    }
}
```

### 4.3 主要エンティティ

#### Reservation
```java
@Entity
@Table(name = "reservation")
public class Reservation extends FrontendGeneratedIdEntity {
    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "reservation_count", nullable = false)
    private Integer reservationCount;
}
```

#### ReservationStatus
```java
@Entity
@Table(name = "reservation_status")
public class ReservationStatus extends BaseEntity {
    @Id
    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;
    
    @Column(name = "memo")
    private String memo;
}
```

### 4.4 ベストプラクティス
- 適切なテーブル名とカラム名の使用
- 必要な制約の設定
- リレーションシップの適切な定義
- 監査情報の管理

## 5. Mapper層

### 5.1 役割と責務
- SQLクエリの定義
- オブジェクトとデータベースのマッピング
- データアクセスの実装

### 5.2 実装例
```java
@Mapper
public interface InventoryConfirmationMapper {
    @Select("SELECT * FROM inventory_confirmation WHERE business_date = #{businessDate}")
    List<InventoryConfirmation> findByBusinessDate(@Param("businessDate") Date businessDate);

    @Insert("INSERT INTO inventory_confirmation (business_date, item_id, quantity) " +
            "VALUES (#{businessDate}, #{itemId}, #{quantity})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(InventoryConfirmation confirmation);

    @Update("UPDATE inventory_confirmation SET quantity = #{quantity} " +
            "WHERE id = #{id}")
    void update(InventoryConfirmation confirmation);
}
```

### 5.3 ベストプラクティス
- SQLの最適化
- パラメータ化クエリの使用
- 適切なインデックスの使用
- エラーハンドリングの実装

## 6. XML Mapper

### 6.1 役割と責務
- 複雑なSQLクエリの定義
- 動的SQLの実装
- 結果マッピングの定義

### 6.2 実装例
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.uniwaapp.nextdayops.mapper.InventoryConfirmationMapper">
    <resultMap id="inventoryConfirmationResultMap" type="com.uniwaapp.nextdayops.entity.InventoryConfirmation">
        <id property="id" column="id"/>
        <result property="businessDate" column="business_date" typeHandler="org.apache.ibatis.type.DateTypeHandler"/>
        <result property="itemId" column="item_id"/>
        <result property="quantity" column="quantity"/>
        <result property="createdAt" column="created_at" typeHandler="org.apache.ibatis.type.DateTypeHandler"/>
        <result property="updatedAt" column="updated_at" typeHandler="org.apache.ibatis.type.DateTypeHandler"/>
    </resultMap>

    <select id="findByBusinessDate" resultMap="inventoryConfirmationResultMap">
        SELECT *
        FROM inventory_confirmation
        WHERE business_date = #{businessDate}
    </select>
</mapper>
```

### 6.3 ベストプラクティス
- 適切な名前空間の使用
- 結果マッピングの定義
- 動的SQLの適切な使用
- パフォーマンスの考慮 