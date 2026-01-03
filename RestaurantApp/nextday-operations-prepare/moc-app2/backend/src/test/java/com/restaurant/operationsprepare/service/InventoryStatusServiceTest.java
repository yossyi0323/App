package com.restaurant.operationsprepare.service;

import com.restaurant.operationsprepare.entity.InventoryStatus;
import com.restaurant.operationsprepare.entity.Item;
import com.restaurant.operationsprepare.exception.OptimisticLockException;
import com.restaurant.operationsprepare.repository.InventoryStatusRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryStatusServiceTest {

    @Mock
    private InventoryStatusRepository inventoryStatusRepository;

    @InjectMocks
    private InventoryStatusService inventoryStatusService;

    private InventoryStatus testStatus;
    private Item testItem;
    private UUID statusId;
    private UUID itemId;

    @BeforeEach
    void setUp() {
        statusId = UUID.randomUUID();
        itemId = UUID.randomUUID();

        testItem = new Item();
        testItem.setId(itemId);
        testItem.setName("テスト品物");
        testItem.setUnit("個");
        testItem.setCreatedAt(LocalDateTime.now());
        testItem.setUpdatedAt(LocalDateTime.now());

        testStatus = new InventoryStatus();
        testStatus.setId(statusId);
        testStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        testStatus.setItemId(itemId);
        testStatus.setItem(testItem);
        testStatus.setInventoryCheckStatus("未確認");
        testStatus.setReplenishmentStatus("要補充");
        testStatus.setPreparationStatus("作成不要");
        testStatus.setOrderRequestStatus("発注不要");
        testStatus.setInventoryCount(5);
        testStatus.setReplenishmentCount(10);
        testStatus.setVersion(0);
        testStatus.setCreatedAt(LocalDateTime.now());
        testStatus.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetInventoryStatusByDate() {
        List<InventoryStatus> expectedStatuses = Arrays.asList(testStatus);
        when(inventoryStatusRepository.findByBusinessDate(any(LocalDate.class)))
                .thenReturn(expectedStatuses);

        List<InventoryStatus> result = inventoryStatusService.getInventoryStatusByDate(LocalDate.of(2025, 9, 27));

        assertEquals(1, result.size());
        assertEquals("要補充", result.get(0).getReplenishmentStatus());
        verify(inventoryStatusRepository).findByBusinessDate(any(LocalDate.class));
    }

    @Test
    void testGetInventoryStatusById() {
        when(inventoryStatusRepository.findById(statusId))
                .thenReturn(Optional.of(testStatus));

        Optional<InventoryStatus> result = inventoryStatusService.getInventoryStatusById(statusId);

        assertTrue(result.isPresent());
        assertEquals(statusId, result.get().getId());
        verify(inventoryStatusRepository).findById(statusId);
    }

    @Test
    void testSaveInventoryStatus_New() {
        InventoryStatus newStatus = new InventoryStatus();
        newStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        newStatus.setItemId(itemId);
        newStatus.setInventoryCheckStatus("未確認");
        newStatus.setReplenishmentStatus("要補充");
        newStatus.setVersion(0);

        // insert()が呼ばれたときにIDを設定
        doAnswer(invocation -> {
            InventoryStatus status = invocation.getArgument(0);
            if (status.getId() == null) {
                status.setId(statusId);
            }
            return null;
        }).when(inventoryStatusRepository).insert(any(InventoryStatus.class));

        when(inventoryStatusRepository.findById(statusId))
                .thenReturn(Optional.of(testStatus));

        InventoryStatus result = inventoryStatusService.saveInventoryStatus(newStatus);

        assertNotNull(result.getId());
        verify(inventoryStatusRepository).insert(any(InventoryStatus.class));
        verify(inventoryStatusRepository).findById(statusId);
    }

    @Test
    void testSaveInventoryStatus_Update() {
        testStatus.setVersion(0);
        when(inventoryStatusRepository.update(any(InventoryStatus.class))).thenReturn(1);
        when(inventoryStatusRepository.findById(statusId))
                .thenReturn(Optional.of(testStatus));

        InventoryStatus result = inventoryStatusService.saveInventoryStatus(testStatus);

        assertEquals(statusId, result.getId());
        verify(inventoryStatusRepository).update(any(InventoryStatus.class));
        verify(inventoryStatusRepository).findById(statusId);
    }

    @Test
    void testSaveInventoryStatus_OptimisticLockException() {
        testStatus.setVersion(0);
        when(inventoryStatusRepository.update(any(InventoryStatus.class))).thenReturn(0);

        assertThrows(OptimisticLockException.class, () -> {
            inventoryStatusService.saveInventoryStatus(testStatus);
        });

        verify(inventoryStatusRepository).update(any(InventoryStatus.class));
        verify(inventoryStatusRepository, never()).findById(any());
    }

    @Test
    void testDeleteInventoryStatus() {
        inventoryStatusService.deleteInventoryStatus(statusId);

        verify(inventoryStatusRepository).delete(statusId);
    }
}

