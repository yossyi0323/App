package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.Place;
import com.uniwa.operationsprepare.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PlaceService {

    @Autowired
    private PlaceRepository placeRepository;

    @Transactional(readOnly = true)
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Place> getPlacesByType(String type) {
        return placeRepository.findByType(type);
    }
}


