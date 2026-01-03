package com.restaurant.operationsprepare.controller;

import com.restaurant.operationsprepare.entity.InventoryStatus;
import com.restaurant.operationsprepare.service.InventoryStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory-status")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "在庫ステータス", description = "在庫確認業務のステータス管理API")
public class InventoryStatusController {

    @Autowired
    private InventoryStatusService inventoryStatusService;

    /**
     * 業務日付で在庫ステータスを取得する
     * 
     * @param businessDate 業務日付（YYYY-MM-DD形式）
     * @return 在庫ステータスのリスト（該当なしの場合は空リスト）
     */
    @Operation(
        summary = "業務日付で在庫ステータスを取得", 
        description = """
            指定した業務日付の全在庫ステータスを取得します。
            
            ## 処理フロー
            1. inventory_statusテーブルをbusiness_dateで検索
            2. item情報を外部キー結合（LEFT JOIN）で取得
            3. item.nameで昇順ソート
            
            ## 返却データ
            - 在庫ステータスのリスト（該当なしの場合は空配列）
            - 各ステータスにはitem情報が含まれる
            
            ## 正常系
            - データあり: 該当する全在庫ステータスを返す
            - データなし: 空配列 [] を返す（エラーではない）
            
            ## 異常系
            - businessDate未指定: 400 Bad Request
            - 日付フォーマット不正: 400 Bad Request
            
            ## パフォーマンス
            - N+1問題回避: item情報を1クエリで結合取得
            - インデックス: business_date列に必要
            """
    )
    @GetMapping
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDate(
            @Parameter(description = "業務日付（YYYY-MM-DD形式）", required = true, example = "2025-09-27")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate) {
        List<InventoryStatus> statuses = inventoryStatusService.getInventoryStatusByDate(businessDate);
        return ResponseEntity.ok(statuses);
    }

    @Operation(summary = "補充先で在庫ステータスを取得", description = "指定した業務日付と補充先の在庫ステータスを取得します")
    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDateAndDestination(
            @Parameter(description = "業務日付", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate,
            @Parameter(description = "補充先ID", required = true) @PathVariable UUID destinationId) {
        List<InventoryStatus> statuses = inventoryStatusService.getInventoryStatusByDateAndDestination(businessDate, destinationId);
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDateAndSource(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate,
            @PathVariable UUID sourceId) {
        List<InventoryStatus> statuses = inventoryStatusService.getInventoryStatusByDateAndSource(businessDate, sourceId);
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<InventoryStatus>> getPendingItemsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate) {
        List<InventoryStatus> statuses = inventoryStatusService.getPendingItemsByDate(businessDate);
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<InventoryStatus> getInventoryStatusByDateAndItem(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate,
            @PathVariable UUID itemId) {
        Optional<InventoryStatus> status = inventoryStatusService.getInventoryStatusByDateAndItem(businessDate, itemId);
        return status.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InventoryStatus> createInventoryStatus(@RequestBody InventoryStatus inventoryStatus) {
        InventoryStatus savedStatus = inventoryStatusService.saveInventoryStatus(inventoryStatus);
        return ResponseEntity.ok(savedStatus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryStatus> updateInventoryStatus(@PathVariable UUID id, @RequestBody InventoryStatus inventoryStatus) {
        inventoryStatus.setId(id);
        InventoryStatus savedStatus = inventoryStatusService.saveInventoryStatus(inventoryStatus);
        return ResponseEntity.ok(savedStatus);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<InventoryStatus>> saveInventoryStatusesBatch(@RequestBody List<InventoryStatus> inventoryStatuses) {
        List<InventoryStatus> savedStatuses = inventoryStatusService.saveInventoryStatuses(inventoryStatuses);
        return ResponseEntity.ok(savedStatuses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryStatus(@PathVariable UUID id) {
        inventoryStatusService.deleteInventoryStatus(id);
        return ResponseEntity.noContent().build();
    }
}
