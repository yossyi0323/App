package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.entity.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface InventoryStatusRepository extends JpaRepository<InventoryStatus, UUID> {

    List<InventoryStatus> findByBusinessDateOrderByItemName(LocalDate businessDate);

    Optional<InventoryStatus> findByBusinessDateAndItemId(LocalDate businessDate, UUID itemId);

    @Query("SELECT ins FROM InventoryStatus ins " +
           "WHERE ins.businessDate = :businessDate " +
           "AND ins.item.id IN (SELECT DISTINCT ir.item.id FROM ItemReplenishment ir " +
           "WHERE ir.destinationLocation.id = :destinationId) " +
           "ORDER BY ins.item.name")
    List<InventoryStatus> findByBusinessDateAndDestinationLocationId(
            @Param("businessDate") LocalDate businessDate,
            @Param("destinationId") UUID destinationId);

    @Query("SELECT ins FROM InventoryStatus ins " +
           "WHERE ins.businessDate = :businessDate " +
           "AND ins.item.id IN (SELECT DISTINCT ir.item.id FROM ItemReplenishment ir " +
           "WHERE ir.sourceLocation.id = :sourceId) " +
           "ORDER BY ins.item.name")
    List<InventoryStatus> findByBusinessDateAndSourceLocationId(
            @Param("businessDate") LocalDate businessDate,
            @Param("sourceId") UUID sourceId);

    @Query("SELECT ins FROM InventoryStatus ins " +
           "WHERE ins.businessDate = :businessDate " +
           "AND (ins.inventoryCheckStatus = '未確認' " +
           "OR ins.replenishmentStatus = '要補充' " +
           "OR ins.preparationStatus = '要作成' " +
           "OR ins.orderRequestStatus = '要発注依頼') " +
           "ORDER BY ins.item.name")
    List<InventoryStatus> findPendingItemsByBusinessDate(@Param("businessDate") LocalDate businessDate);
}
