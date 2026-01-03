package com.restaurant.operationsprepare.service;

import com.restaurant.operationsprepare.entity.InventoryStatus;
import com.restaurant.operationsprepare.repository.InventoryStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InventoryStatusService {

    @Autowired
    private InventoryStatusRepository inventoryStatusRepository;

    @Transactional(readOnly = true)
    public List<InventoryStatus> getInventoryStatusByDate(LocalDate businessDate) {
        return inventoryStatusRepository.findByBusinessDateOrderByItemName(businessDate);
    }

    @Transactional(readOnly = true)
    public List<InventoryStatus> getInventoryStatusByDateAndDestination(LocalDate businessDate, UUID destinationId) {
        return inventoryStatusRepository.findByBusinessDateAndDestinationLocationId(businessDate, destinationId);
    }

    @Transactional(readOnly = true)
    public List<InventoryStatus> getInventoryStatusByDateAndSource(LocalDate businessDate, UUID sourceId) {
        return inventoryStatusRepository.findByBusinessDateAndSourceLocationId(businessDate, sourceId);
    }

    @Transactional(readOnly = true)
    public List<InventoryStatus> getPendingItemsByDate(LocalDate businessDate) {
        return inventoryStatusRepository.findPendingItemsByBusinessDate(businessDate);
    }

    @Transactional(readOnly = true)
    public Optional<InventoryStatus> getInventoryStatusByDateAndItem(LocalDate businessDate, UUID itemId) {
        return inventoryStatusRepository.findByBusinessDateAndItemId(businessDate, itemId);
    }

    public InventoryStatus saveInventoryStatus(InventoryStatus inventoryStatus) {
        return inventoryStatusRepository.save(inventoryStatus);
    }

    public List<InventoryStatus> saveInventoryStatuses(List<InventoryStatus> inventoryStatuses) {
        return inventoryStatusRepository.saveAll(inventoryStatuses);
    }

    public void deleteInventoryStatus(UUID id) {
        inventoryStatusRepository.deleteById(id);
    }
}
