package com.restaurant.operationsprepare.repository;

import com.restaurant.operationsprepare.entity.ItemReplenishment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemReplenishmentRepository extends JpaRepository<ItemReplenishment, UUID> {

    List<ItemReplenishment> findBySourceLocationId(UUID sourceLocationId);

    List<ItemReplenishment> findByDestinationLocationId(UUID destinationLocationId);

    List<ItemReplenishment> findByItemId(UUID itemId);
}
