package com.uniwa.operationsprepare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.service.InventoryStatusService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryStatusController.class)
class InventoryStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InventoryStatusService inventoryStatusService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetInventoryStatusByDate() throws Exception {
        // テストデータ準備
        UUID itemId = UUID.randomUUID();
        Item item = new Item();
        item.setId(itemId);
        item.setName("テスト品物");

        InventoryStatus status = new InventoryStatus();
        status.setId(UUID.randomUUID());
        status.setBusinessDate(LocalDate.of(2025, 9, 27));
        status.setItem(item);
        status.setInventoryCheckStatus("未確認");
        status.setReplenishmentStatus("要補充");
        status.setPreparationStatus("作成不要");
        status.setOrderRequestStatus("発注不要");
        status.setInventoryCount(5);
        status.setReplenishmentCount(10);
        status.setCreatedAt(LocalDateTime.now());
        status.setUpdatedAt(LocalDateTime.now());

        List<InventoryStatus> statuses = Arrays.asList(status);
        when(inventoryStatusService.getInventoryStatusByDate(any(LocalDate.class)))
                .thenReturn(statuses);

        // テスト実行
        mockMvc.perform(get("/api/inventory-status")
                        .param("businessDate", "2025-09-27"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].replenishmentStatus").value("要補充"))
                .andExpect(jsonPath("$[0].item.name").value("テスト品物"));
    }

    @Test
    void testGetInventoryStatusByDateAndSource() throws Exception {
        // テストデータ準備
        UUID sourceId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        
        Item item = new Item();
        item.setId(itemId);
        item.setName("じゃがいも");

        InventoryStatus status = new InventoryStatus();
        status.setId(UUID.randomUUID());
        status.setBusinessDate(LocalDate.of(2025, 9, 27));
        status.setItem(item);
        status.setReplenishmentStatus("要補充");

        List<InventoryStatus> statuses = Arrays.asList(status);
        when(inventoryStatusService.getInventoryStatusByDateAndSource(any(LocalDate.class), eq(sourceId)))
                .thenReturn(statuses);

        // テスト実行
        mockMvc.perform(get("/api/inventory-status/source/{sourceId}", sourceId)
                        .param("businessDate", "2025-09-27"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].replenishmentStatus").value("要補充"))
                .andExpect(jsonPath("$[0].item.name").value("じゃがいも"));
    }

    @Test
    void testCreateInventoryStatus() throws Exception {
        // テストデータ準備
        UUID itemId = UUID.randomUUID();
        Item item = new Item();
        item.setId(itemId);
        item.setName("新規品物");

        InventoryStatus inputStatus = new InventoryStatus();
        inputStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        inputStatus.setItem(item);
        inputStatus.setInventoryCheckStatus("未確認");
        inputStatus.setReplenishmentStatus("要補充");

        InventoryStatus savedStatus = new InventoryStatus();
        savedStatus.setId(UUID.randomUUID());
        savedStatus.setBusinessDate(inputStatus.getBusinessDate());
        savedStatus.setItem(inputStatus.getItem());
        savedStatus.setInventoryCheckStatus(inputStatus.getInventoryCheckStatus());
        savedStatus.setReplenishmentStatus(inputStatus.getReplenishmentStatus());
        savedStatus.setCreatedAt(LocalDateTime.now());
        savedStatus.setUpdatedAt(LocalDateTime.now());

        when(inventoryStatusService.saveInventoryStatus(any(InventoryStatus.class)))
                .thenReturn(savedStatus);

        // テスト実行
        mockMvc.perform(post("/api/inventory-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputStatus)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.replenishmentStatus").value("要補充"));
    }

    @Test
    void testUpdateInventoryStatus() throws Exception {
        // テストデータ準備
        UUID statusId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        
        Item item = new Item();
        item.setId(itemId);
        item.setName("更新品物");

        InventoryStatus updateStatus = new InventoryStatus();
        updateStatus.setId(statusId);
        updateStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        updateStatus.setItem(item);
        updateStatus.setReplenishmentStatus("補充済");
        updateStatus.setUpdatedAt(LocalDateTime.now());

        when(inventoryStatusService.saveInventoryStatus(any(InventoryStatus.class)))
                .thenReturn(updateStatus);

        // テスト実行
        mockMvc.perform(put("/api/inventory-status/{id}", statusId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.replenishmentStatus").value("補充済"));
    }

    @Test
    void testDeleteInventoryStatus() throws Exception {
        UUID statusId = UUID.randomUUID();
        
        // テスト実行
        mockMvc.perform(delete("/api/inventory-status/{id}", statusId))
                .andExpect(status().isNoContent());
    }
}
