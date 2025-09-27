package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaceRepository extends JpaRepository<Place, UUID> {

    List<Place> findByTypeOrderByDisplayOrderAsc(String type);

    @Query("SELECT p FROM Place p ORDER BY p.type, p.displayOrder ASC")
    List<Place> findAllOrderedByTypeAndDisplayOrder();
}
