package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.exception.OptimisticLockException;
import com.uniwa.operationsprepare.repository.InventoryStatusRepository;
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
        return inventoryStatusRepository.findByBusinessDate(businessDate);
    }

    @Transactional(readOnly = true)
    public Optional<InventoryStatus> getInventoryStatusById(UUID id) {
        return inventoryStatusRepository.findById(id);
    }

    public InventoryStatus saveInventoryStatus(InventoryStatus inventoryStatus) {
        if (inventoryStatus.getId() == null) {
            // 新規作成
            inventoryStatusRepository.insert(inventoryStatus);
            // 作成後に再取得（item情報を含む）
            return inventoryStatusRepository.findById(inventoryStatus.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to create inventory status"));
        } else {
            // 更新（楽観ロック対応）
            int updated = inventoryStatusRepository.update(inventoryStatus);
            if (updated == 0) {
                throw new OptimisticLockException("Version mismatch. The data has been updated by another user.");
            }
            // 更新後に再取得（item情報を含む）
            return inventoryStatusRepository.findById(inventoryStatus.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to update inventory status"));
        }
    }

    public void saveInventoryStatusesBulk(List<InventoryStatus> inventoryStatuses) {
        for (InventoryStatus status : inventoryStatuses) {
            saveInventoryStatus(status);
        }
    }

    public void deleteInventoryStatus(UUID id) {
        inventoryStatusRepository.delete(id);
    }
}
