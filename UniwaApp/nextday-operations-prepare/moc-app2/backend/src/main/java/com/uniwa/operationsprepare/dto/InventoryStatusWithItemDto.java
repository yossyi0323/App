package com.uniwa.operationsprepare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 在庫ステータスとItem情報をJOINした結果用DTO
 * UroboroSQLのSQL結果をマッピングするために使用
 * カラム名はsnake_caseのまま（UroboroSQLはカラム名をそのままフィールド名にマッピング）
 */
@Data
public class InventoryStatusWithItemDto {
    
    // InventoryStatusのフィールド（SQLのカラム名と一致）
    private UUID id;
    
    @JsonProperty("business_date")
    private LocalDate business_date; // SQLカラム名: business_date
    
    @JsonProperty("item_id")
    private UUID item_id; // SQLカラム名: item_id
    
    @JsonProperty("inventory_check_status")
    private String inventory_check_status;
    
    @JsonProperty("replenishment_status")
    private String replenishment_status;
    
    @JsonProperty("preparation_status")
    private String preparation_status;
    
    @JsonProperty("order_request_status")
    private String order_request_status;
    
    @JsonProperty("inventory_count")
    private Integer inventory_count;
    
    @JsonProperty("replenishment_count")
    private Integer replenishment_count;
    
    @JsonProperty("replenishment_note")
    private String replenishment_note;
    
    @JsonProperty("version")
    private Integer version;
    
    @JsonProperty("created_at")
    private LocalDateTime created_at;
    
    @JsonProperty("updated_at")
    private LocalDateTime updated_at;
    
    // Itemのフィールド
    @JsonProperty("item_id2")
    private UUID item_id2; // SQLカラム名: item_id2
    
    @JsonProperty("item_name")
    private String item_name;
    
    @JsonProperty("item_description")
    private String item_description;
    
    @JsonProperty("item_unit")
    private String item_unit;
    
    @JsonProperty("item_pattern_type")
    private String item_pattern_type;
    
    @JsonProperty("item_created_at")
    private LocalDateTime item_created_at;
    
    @JsonProperty("item_updated_at")
    private LocalDateTime item_updated_at;
}

