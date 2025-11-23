package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.dto.InventoryStatusWithItemDto;
import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.entity.Item;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class InventoryStatusRepositoryTest {

    @Autowired
    private InventoryStatusRepository repository;

    private UUID testItemId;
    private UUID testStatusId;
    private LocalDate testBusinessDate;

    @BeforeEach
    void setUp() {
        testItemId = UUID.randomUUID();
        testStatusId = UUID.randomUUID();
        testBusinessDate = LocalDate.of(2025, 9, 27);
        
        // テストデータを準備
        // Itemを作成
        // InventoryStatusを作成
        // このテストは実際のPostgreSQLデータベース接続が必要
    }

    @Test
    void testFindByBusinessDate_Empty() {
        // テストデータがない場合
        List<InventoryStatus> result = repository.findByBusinessDate(testBusinessDate);
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void testFindById_NotFound() {
        // 存在しないIDの場合
        Optional<InventoryStatus> result = repository.findById(testStatusId);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}

