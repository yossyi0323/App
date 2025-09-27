package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {

    @Query("SELECT DISTINCT i FROM Item i " +
           "JOIN ItemReplenishment ir ON ir.item.id = i.id " +
           "WHERE ir.destinationLocation.id = :destinationId " +
           "ORDER BY i.name")
    List<Item> findByDestinationLocationId(@Param("destinationId") UUID destinationId);

    @Query("SELECT DISTINCT i FROM Item i " +
           "JOIN ItemReplenishment ir ON ir.item.id = i.id " +
           "WHERE ir.sourceLocation.id = :sourceId " +
           "ORDER BY i.name")
    List<Item> findBySourceLocationId(@Param("sourceId") UUID sourceId);

    List<Item> findByNameContainingIgnoreCaseOrderByName(String name);
}
