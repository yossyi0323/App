package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.repository.InventoryStatusRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryStatusServiceTest {

    @Mock
    private InventoryStatusRepository inventoryStatusRepository;

    @InjectMocks
    private InventoryStatusService inventoryStatusService;

    private Item testItem;
    private InventoryStatus testStatus;
    private LocalDate testDate;
    private UUID testSourceId;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2025, 9, 27);
        testSourceId = UUID.randomUUID();
        
        testItem = new Item();
        testItem.setId(UUID.randomUUID());
        testItem.setName("テスト品物");

        testStatus = new InventoryStatus();
        testStatus.setId(UUID.randomUUID());
        testStatus.setBusinessDate(testDate);
        testStatus.setItem(testItem);
        testStatus.setInventoryCheckStatus("未確認");
        testStatus.setReplenishmentStatus("要補充");
        testStatus.setPreparationStatus("作成不要");
        testStatus.setOrderRequestStatus("発注不要");
        testStatus.setInventoryCount(5);
        testStatus.setReplenishmentCount(10);
        testStatus.setCreatedAt(LocalDateTime.now());
        testStatus.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetInventoryStatusByDate() {
        // Given
        List<InventoryStatus> expectedStatuses = Arrays.asList(testStatus);
        when(inventoryStatusRepository.findByBusinessDateOrderByItemName(testDate))
                .thenReturn(expectedStatuses);

        // When
        List<InventoryStatus> result = inventoryStatusService.getInventoryStatusByDate(testDate);

        // Then
        assertEquals(1, result.size());
        assertEquals("要補充", result.get(0).getReplenishmentStatus());
        assertEquals("テスト品物", result.get(0).getItem().getName());
        verify(inventoryStatusRepository).findByBusinessDateOrderByItemName(testDate);
    }

    @Test
    void testGetInventoryStatusByDateAndSource() {
        // Given
        List<InventoryStatus> expectedStatuses = Arrays.asList(testStatus);
        when(inventoryStatusRepository.findByBusinessDateAndSourceLocationId(testDate, testSourceId))
                .thenReturn(expectedStatuses);

        // When
        List<InventoryStatus> result = inventoryStatusService.getInventoryStatusByDateAndSource(testDate, testSourceId);

        // Then
        assertEquals(1, result.size());
        assertEquals("要補充", result.get(0).getReplenishmentStatus());
        verify(inventoryStatusRepository).findByBusinessDateAndSourceLocationId(testDate, testSourceId);
    }

    @Test
    void testGetPendingItemsByDate() {
        // Given
        List<InventoryStatus> expectedStatuses = Arrays.asList(testStatus);
        when(inventoryStatusRepository.findPendingItemsByBusinessDate(testDate))
                .thenReturn(expectedStatuses);

        // When
        List<InventoryStatus> result = inventoryStatusService.getPendingItemsByDate(testDate);

        // Then
        assertEquals(1, result.size());
        assertEquals("要補充", result.get(0).getReplenishmentStatus());
        verify(inventoryStatusRepository).findPendingItemsByBusinessDate(testDate);
    }

    @Test
    void testSaveInventoryStatus() {
        // Given
        when(inventoryStatusRepository.save(any(InventoryStatus.class)))
                .thenReturn(testStatus);

        // When
        InventoryStatus result = inventoryStatusService.saveInventoryStatus(testStatus);

        // Then
        assertNotNull(result);
        assertEquals("要補充", result.getReplenishmentStatus());
        verify(inventoryStatusRepository).save(testStatus);
    }

    @Test
    void testDeleteInventoryStatus() {
        // Given
        UUID statusId = UUID.randomUUID();
        doNothing().when(inventoryStatusRepository).deleteById(statusId);

        // When & Then
        assertDoesNotThrow(() -> inventoryStatusService.deleteInventoryStatus(statusId));
        verify(inventoryStatusRepository).deleteById(statusId);
    }

    @Test
    void testGetInventoryStatusByDateAndItem() {
        // Given
        UUID itemId = UUID.randomUUID();
        when(inventoryStatusRepository.findByBusinessDateAndItemId(testDate, itemId))
                .thenReturn(Optional.of(testStatus));

        // When
        Optional<InventoryStatus> result = inventoryStatusService.getInventoryStatusByDateAndItem(testDate, itemId);

        // Then
        assertTrue(result.isPresent());
        assertEquals("要補充", result.get().getReplenishmentStatus());
        verify(inventoryStatusRepository).findByBusinessDateAndItemId(testDate, itemId);
    }

    @Test
    void testGetInventoryStatusByDateAndItemNotFound() {
        // Given
        UUID itemId = UUID.randomUUID();
        when(inventoryStatusRepository.findByBusinessDateAndItemId(testDate, itemId))
                .thenReturn(Optional.empty());

        // When
        Optional<InventoryStatus> result = inventoryStatusService.getInventoryStatusByDateAndItem(testDate, itemId);

        // Then
        assertFalse(result.isPresent());
        verify(inventoryStatusRepository).findByBusinessDateAndItemId(testDate, itemId);
    }
}
