package com.restaurant.operationsprepare.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 在庫補充状況管理トラン
 * UroboroSQL用のエンティティクラス（JPAアノテーションなし）
 */
@Data
public class InventoryStatus {

    private UUID id;

    @JsonProperty("businessDate")
    private LocalDate businessDate;

    @JsonProperty("itemId")
    private UUID itemId;

    @JsonProperty("item")
    private Item item; // JOIN結果用

    @JsonProperty("inventoryCheckStatus")
    private String inventoryCheckStatus; // 在庫確認ステータス

    @JsonProperty("replenishmentStatus")
    private String replenishmentStatus; // 補充ステータス

    @JsonProperty("preparationStatus")
    private String preparationStatus; // 作成ステータス

    @JsonProperty("orderRequestStatus")
    private String orderRequestStatus; // 発注依頼ステータス

    @JsonProperty("inventoryCount")
    private Integer inventoryCount; // 在庫数

    @JsonProperty("replenishmentCount")
    private Integer replenishmentCount; // 補充数

    @JsonProperty("replenishmentNote")
    private String replenishmentNote; // 補充メモ

    @JsonProperty("version")
    private Integer version; // 楽観ロック用バージョン列

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}

