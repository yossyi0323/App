package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.Place;
import com.uniwa.operationsprepare.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PlaceService {

    @Autowired
    private PlaceRepository placeRepository;

    @Transactional(readOnly = true)
    public List<Place> getAllPlaces() {
        return placeRepository.findAllOrderedByTypeAndDisplayOrder();
    }

    @Transactional(readOnly = true)
    public List<Place> getPlacesByType(String type) {
        return placeRepository.findByTypeOrderByDisplayOrderAsc(type);
    }

    @Transactional(readOnly = true)
    public List<Place> getSourcePlaces() {
        return getPlacesByType("補充元");
    }

    @Transactional(readOnly = true)
    public List<Place> getDestinationPlaces() {
        return getPlacesByType("補充先");
    }

    public Place savePlace(Place place) {
        return placeRepository.save(place);
    }

    public void deletePlace(UUID id) {
        placeRepository.deleteById(id);
    }
}
