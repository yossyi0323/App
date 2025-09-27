package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.InventoryStatus;
import com.uniwa.operationsprepare.service.InventoryStatusService;
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
public class InventoryStatusController {

    @Autowired
    private InventoryStatusService inventoryStatusService;

    @GetMapping
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate) {
        List<InventoryStatus> statuses = inventoryStatusService.getInventoryStatusByDate(businessDate);
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<InventoryStatus>> getInventoryStatusByDateAndDestination(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate businessDate,
            @PathVariable UUID destinationId) {
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
