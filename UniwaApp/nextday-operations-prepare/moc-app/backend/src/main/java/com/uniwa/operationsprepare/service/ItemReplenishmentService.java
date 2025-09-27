package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.ItemReplenishment;
import com.uniwa.operationsprepare.repository.ItemReplenishmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ItemReplenishmentService {

    @Autowired
    private ItemReplenishmentRepository itemReplenishmentRepository;

    @Transactional(readOnly = true)
    public List<ItemReplenishment> getAllItemReplenishments() {
        return itemReplenishmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ItemReplenishment> getItemReplenishmentById(UUID id) {
        return itemReplenishmentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<ItemReplenishment> getItemReplenishmentsBySource(UUID sourceId) {
        return itemReplenishmentRepository.findBySourceLocationId(sourceId);
    }

    @Transactional(readOnly = true)
    public List<ItemReplenishment> getItemReplenishmentsByDestination(UUID destinationId) {
        return itemReplenishmentRepository.findByDestinationLocationId(destinationId);
    }

    public ItemReplenishment saveItemReplenishment(ItemReplenishment itemReplenishment) {
        return itemReplenishmentRepository.save(itemReplenishment);
    }

    public void deleteItemReplenishment(UUID id) {
        itemReplenishmentRepository.deleteById(id);
    }
}
