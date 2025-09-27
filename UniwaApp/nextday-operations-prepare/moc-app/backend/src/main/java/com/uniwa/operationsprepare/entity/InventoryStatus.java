package com.uniwa.operationsprepare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_status",
       uniqueConstraints = @UniqueConstraint(columnNames = {"business_date", "item_id"}))
@Data
@EqualsAndHashCode(callSuper = false)
public class InventoryStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "business_date", nullable = false)
    @JsonProperty("businessDate")
    private LocalDate businessDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonProperty("item")
    private Item item;

    @Column(name = "inventory_check_status", nullable = false)
    @JsonProperty("inventoryCheckStatus")
    private String inventoryCheckStatus; // 在庫確認ステータス

    @Column(name = "replenishment_status", nullable = false)
    @JsonProperty("replenishmentStatus")
    private String replenishmentStatus; // 補充ステータス

    @Column(name = "preparation_status", nullable = false)
    @JsonProperty("preparationStatus")
    private String preparationStatus; // 作成ステータス

    @Column(name = "order_request_status", nullable = false)
    @JsonProperty("orderRequestStatus")
    private String orderRequestStatus; // 発注依頼ステータス

    @Column(name = "inventory_count")
    @JsonProperty("inventoryCount")
    private Integer inventoryCount; // 在庫数

    @Column(name = "replenishment_count")
    @JsonProperty("replenishmentCount")
    private Integer replenishmentCount; // 補充数

    @Column(name = "replenishment_note", columnDefinition = "TEXT")
    @JsonProperty("replenishmentNote")
    private String replenishmentNote; // 補充メモ

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
