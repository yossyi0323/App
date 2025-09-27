package com.uniwa.operationsprepare.controller;

import com.uniwa.operationsprepare.entity.Place;
import com.uniwa.operationsprepare.service.PlaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "http://localhost:3000")
public class PlaceController {

    @Autowired
    private PlaceService placeService;

    @GetMapping
    public ResponseEntity<List<Place>> getAllPlaces() {
        List<Place> places = placeService.getAllPlaces();
        return ResponseEntity.ok(places);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Place>> getPlacesByType(@PathVariable String type) {
        List<Place> places = placeService.getPlacesByType(type);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/source")
    public ResponseEntity<List<Place>> getSourcePlaces() {
        List<Place> places = placeService.getSourcePlaces();
        return ResponseEntity.ok(places);
    }

    @GetMapping("/destination")
    public ResponseEntity<List<Place>> getDestinationPlaces() {
        List<Place> places = placeService.getDestinationPlaces();
        return ResponseEntity.ok(places);
    }

    @PostMapping
    public ResponseEntity<Place> createPlace(@RequestBody Place place) {
        Place savedPlace = placeService.savePlace(place);
        return ResponseEntity.ok(savedPlace);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable UUID id, @RequestBody Place place) {
        place.setId(id);
        Place savedPlace = placeService.savePlace(place);
        return ResponseEntity.ok(savedPlace);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable UUID id) {
        placeService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }
}
