/**
 * React example with hooks
 */

import React, { useState, useEffect, useRef } from 'react';
import { createReactiveManager, SaveState } from '../src';

const ENTITY = {
  ITEM: 'item',
} as const;

interface Item {
  id: string;
  name: string;
  version: number;
}

export function useItemManager() {
  const [item, setItem] = useState<Item>({
    id: '123',
    name: '',
    version: 1,
  });
  const [saveStatus, setSaveStatus] = useState('');
  const managerRef = useRef(createReactiveManager());

  useEffect(() => {
    const manager = managerRef.current;

    // Register entity
    manager.register<Item>(ENTITY.ITEM, {
      baseUrl: '/api/items',
      debounceMs: 1000,
      
      onStateChange: (state) => {
        if (state === SaveState.SAVING) {
          setSaveStatus('保存中...');
        } else if (state === SaveState.SAVED) {
          setSaveStatus('保存しました');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      },
    });

    return () => {
      // Cleanup
      manager.unregister(ENTITY.ITEM);
    };
  }, []);

  // Save item (with auto-save debounce)
  const saveItem = (updatedItem: Item) => {
    setItem(updatedItem);
    managerRef.current.save(ENTITY.ITEM, updatedItem);
  };

  // Force save immediately
  const forceSave = async () => {
    await managerRef.current.save(ENTITY.ITEM, item, { immediate: true });
  };

  return {
    item,
    saveStatus,
    saveItem,
    forceSave,
  };
}

// Usage in React component:
export function ItemForm() {
  const { item, saveStatus, saveItem, forceSave } = useItemManager();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveItem({
      ...item,
      name: e.target.value,
    });
  };

  return (
    <div>
      <input 
        type="text" 
        value={item.name} 
        onChange={handleNameChange} 
      />
      <button onClick={forceSave}>即座に保存</button>
      <span>{saveStatus}</span>
    </div>
  );
}

