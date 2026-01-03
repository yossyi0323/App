package com.restaurant.operationsprepare.controller;

import com.restaurant.operationsprepare.entity.ItemReplenishment;
import com.restaurant.operationsprepare.service.ItemReplenishmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/item-replenishment")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemReplenishmentController {

    @Autowired
    private ItemReplenishmentService itemReplenishmentService;

    @GetMapping
    public ResponseEntity<List<ItemReplenishment>> getAllItemReplenishments() {
        List<ItemReplenishment> replenishments = itemReplenishmentService.getAllItemReplenishments();
        return ResponseEntity.ok(replenishments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemReplenishment> getItemReplenishmentById(@PathVariable UUID id) {
        return itemReplenishmentService.getItemReplenishmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<ItemReplenishment>> getItemReplenishmentsBySource(@PathVariable UUID sourceId) {
        List<ItemReplenishment> replenishments = itemReplenishmentService.getItemReplenishmentsBySource(sourceId);
        return ResponseEntity.ok(replenishments);
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<ItemReplenishment>> getItemReplenishmentsByDestination(@PathVariable UUID destinationId) {
        List<ItemReplenishment> replenishments = itemReplenishmentService.getItemReplenishmentsByDestination(destinationId);
        return ResponseEntity.ok(replenishments);
    }
}
