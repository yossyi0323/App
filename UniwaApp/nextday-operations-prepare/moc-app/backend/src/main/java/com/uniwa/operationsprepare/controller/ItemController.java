package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        List<Item> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable UUID id) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<Item>> getItemsByDestination(@PathVariable UUID destinationId) {
        List<Item> items = itemService.getItemsByDestination(destinationId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/source/{sourceId}")
    public ResponseEntity<List<Item>> getItemsBySource(@PathVariable UUID sourceId) {
        List<Item> items = itemService.getItemsBySource(sourceId);
        return ResponseEntity.ok(items);
    }
}
