package com.uniwa.operationsprepare.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.entity.Place;
import com.uniwa.operationsprepare.repository.InventoryStatusRepository;
import com.uniwa.operationsprepare.repository.ItemRepository;
import com.uniwa.operationsprepare.repository.PlaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class InventoryStatusIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private InventoryStatusRepository inventoryStatusRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private Item testItem;
    private Place testSourcePlace;
    private InventoryStatus testStatus;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // テストデータ作成
        testItem = new Item();
        testItem.setName("統合テスト品物");
        testItem.setDescription("統合テスト用");
        testItem.setUnit("個");
        testItem = itemRepository.save(testItem);

        testSourcePlace = new Place();
        testSourcePlace.setType("補充元");
        testSourcePlace.setName("テスト補充元");
        testSourcePlace.setDisplayOrder(1);
        testSourcePlace = placeRepository.save(testSourcePlace);

        testStatus = new InventoryStatus();
        testStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        testStatus.setItem(testItem);
        testStatus.setInventoryCheckStatus("未確認");
        testStatus.setReplenishmentStatus("要補充");
        testStatus.setPreparationStatus("作成不要");
        testStatus.setOrderRequestStatus("発注不要");
        testStatus.setInventoryCount(5);
        testStatus.setReplenishmentCount(10);
        testStatus.setCreatedAt(LocalDateTime.now());
        testStatus.setUpdatedAt(LocalDateTime.now());
        testStatus = inventoryStatusRepository.save(testStatus);
    }

    @Test
    void testGetInventoryStatusByDateIntegration() throws Exception {
        mockMvc.perform(get("/api/inventory-status")
                        .param("businessDate", "2025-09-27"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].replenishmentStatus").value("要補充"))
                .andExpect(jsonPath("$[0].item.name").value("統合テスト品物"));
    }

    @Test
    void testCreateInventoryStatusIntegration() throws Exception {
        Item newItem = new Item();
        newItem.setName("新規統合テスト品物");
        newItem.setDescription("新規統合テスト用");
        newItem.setUnit("個");
        newItem = itemRepository.save(newItem);

        InventoryStatus newStatus = new InventoryStatus();
        newStatus.setBusinessDate(LocalDate.of(2025, 9, 27));
        newStatus.setItem(newItem);
        newStatus.setInventoryCheckStatus("未確認");
        newStatus.setReplenishmentStatus("要補充");
        newStatus.setPreparationStatus("作成不要");
        newStatus.setOrderRequestStatus("発注不要");
        newStatus.setInventoryCount(3);
        newStatus.setReplenishmentCount(8);

        mockMvc.perform(post("/api/inventory-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.replenishmentStatus").value("要補充"))
                .andExpect(jsonPath("$.item.name").value("新規統合テスト品物"));
    }

    @Test
    void testUpdateInventoryStatusIntegration() throws Exception {
        testStatus.setReplenishmentStatus("補充済");
        testStatus.setUpdatedAt(LocalDateTime.now());

        mockMvc.perform(put("/api/inventory-status/{id}", testStatus.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.replenishmentStatus").value("補充済"));
    }

    @Test
    void testDeleteInventoryStatusIntegration() throws Exception {
        mockMvc.perform(delete("/api/inventory-status/{id}", testStatus.getId()))
                .andExpect(status().isNoContent());

        // 削除確認
        mockMvc.perform(get("/api/inventory-status")
                        .param("businessDate", "2025-09-27"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
