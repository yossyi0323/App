package com.uniwa.operationsprepare.service;

import com.uniwa.operationsprepare.entity.Item;
import com.uniwa.operationsprepare.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Item> getItemById(UUID id) {
        return itemRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByPlaceId(UUID placeId) {
        return itemRepository.findByPlaceId(placeId);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByDestinationId(UUID destinationId) {
        return itemRepository.findByDestinationId(destinationId);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsBySourceId(UUID sourceId) {
        return itemRepository.findBySourceId(sourceId);
    }
}


