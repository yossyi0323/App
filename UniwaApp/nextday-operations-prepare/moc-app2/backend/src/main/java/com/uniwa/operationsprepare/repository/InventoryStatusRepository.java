package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.dto.InventoryStatusWithItemDto;
import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.entity.Item;
import jp.co.future.uroborosql.SqlAgent;
import jp.co.future.uroborosql.config.SqlConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class InventoryStatusRepository {

    @Autowired
    private SqlConfig uroboroSQL;

    /**
     * DTOをInventoryStatusエンティティに変換
     */
    private InventoryStatus convertToInventoryStatus(InventoryStatusWithItemDto dto) {
        InventoryStatus status = new InventoryStatus();
        status.setId(dto.getId());
        status.setBusinessDate(dto.getBusiness_date()); // DTOのフィールド名: business_date
        status.setItemId(dto.getItem_id());
        status.setInventoryCheckStatus(dto.getInventory_check_status());
        status.setReplenishmentStatus(dto.getReplenishment_status());
        status.setPreparationStatus(dto.getPreparation_status());
        status.setOrderRequestStatus(dto.getOrder_request_status());
        status.setInventoryCount(dto.getInventory_count());
        status.setReplenishmentCount(dto.getReplenishment_count());
        status.setReplenishmentNote(dto.getReplenishment_note());
        status.setVersion(dto.getVersion());
        status.setCreatedAt(dto.getCreated_at());
        status.setUpdatedAt(dto.getUpdated_at());

        // Itemオブジェクトを作成
        if (dto.getItem_id2() != null) {
            Item item = new Item();
            item.setId(dto.getItem_id2());
            item.setName(dto.getItem_name());
            item.setDescription(dto.getItem_description());
            item.setUnit(dto.getItem_unit());
            item.setPatternType(dto.getItem_pattern_type());
            item.setCreatedAt(dto.getItem_created_at());
            item.setUpdatedAt(dto.getItem_updated_at());
            status.setItem(item);
        }

        return status;
    }

    /**
     * 業務日付で在庫ステータスを取得（item情報をJOIN）
     */
    public List<InventoryStatus> findByBusinessDate(LocalDate businessDate) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<InventoryStatusWithItemDto> dtos = agent.query("inventory_status/select_by_business_date")
                    .param("businessDate", businessDate)
                    .collect(InventoryStatusWithItemDto.class);

            return dtos.stream()
                    .map(this::convertToInventoryStatus)
                    .collect(Collectors.toList());
        }
    }

    /**
     * IDで在庫ステータスを取得
     */
    public Optional<InventoryStatus> findById(UUID id) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<InventoryStatusWithItemDto> dtos = agent.query("inventory_status/select_by_id")
                    .param("id", id)
                    .collect(InventoryStatusWithItemDto.class);

            return dtos.isEmpty()
                    ? Optional.empty()
                    : Optional.of(convertToInventoryStatus(dtos.get(0)));
        }
    }

    /**
     * 在庫ステータスを新規作成
     */
    public void insert(InventoryStatus inventoryStatus) {
        if (inventoryStatus.getId() == null) {
            inventoryStatus.setId(UUID.randomUUID());
        }
        if (inventoryStatus.getVersion() == null) {
            inventoryStatus.setVersion(0);
        }

        try (SqlAgent agent = uroboroSQL.agent()) {
            agent.update("inventory_status/insert")
                    .param("id", inventoryStatus.getId())
                    .param("businessDate", inventoryStatus.getBusinessDate())
                    .param("itemId", inventoryStatus.getItemId())
                    .param("inventoryCheckStatus", inventoryStatus.getInventoryCheckStatus())
                    .param("replenishmentStatus", inventoryStatus.getReplenishmentStatus())
                    .param("preparationStatus", inventoryStatus.getPreparationStatus())
                    .param("orderRequestStatus", inventoryStatus.getOrderRequestStatus())
                    .param("inventoryCount", inventoryStatus.getInventoryCount())
                    .param("replenishmentCount", inventoryStatus.getReplenishmentCount())
                    .param("replenishmentNote", inventoryStatus.getReplenishmentNote())
                    .param("version", inventoryStatus.getVersion())
                    .count();
        }
    }

    /**
     * 在庫ステータスを更新（楽観ロック対応）
     *
     * @return 更新件数（0の場合は楽観ロックエラー）
     */
    public int update(InventoryStatus inventoryStatus) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            return agent.update("inventory_status/update")
                    .param("id", inventoryStatus.getId())
                    .param("inventoryCheckStatus", inventoryStatus.getInventoryCheckStatus())
                    .param("replenishmentStatus", inventoryStatus.getReplenishmentStatus())
                    .param("preparationStatus", inventoryStatus.getPreparationStatus())
                    .param("orderRequestStatus", inventoryStatus.getOrderRequestStatus())
                    .param("inventoryCount", inventoryStatus.getInventoryCount())
                    .param("replenishmentCount", inventoryStatus.getReplenishmentCount())
                    .param("replenishmentNote", inventoryStatus.getReplenishmentNote())
                    .param("version", inventoryStatus.getVersion())
                    .count();
        }
    }

    /**
     * 在庫ステータスを削除
     */
    public void delete(UUID id) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            agent.update("inventory_status/delete")
                    .param("id", id)
                    .count();
        }
    }
}
