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
    public List<Item> getItemsByDestination(UUID destinationId) {
        return itemRepository.findByDestinationLocationId(destinationId);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsBySource(UUID sourceId) {
        return itemRepository.findBySourceLocationId(sourceId);
    }

    public Item saveItem(Item item) {
        return itemRepository.save(item);
    }

    public void deleteItem(UUID id) {
        itemRepository.deleteById(id);
    }
}
