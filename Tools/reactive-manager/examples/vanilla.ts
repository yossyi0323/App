/**
 * Vanilla TypeScript example
 */

import { createReactiveManager } from '../src';

// Entity key constants
const ENTITY = {
  ITEM: 'item',
} as const;

interface Item {
  id: string;
  name: string;
  version: number;
}

// Create manager
const manager = createReactiveManager();

// Register entity
manager.register<Item>(ENTITY.ITEM, {
  baseUrl: '/api/items', // REST API auto-configuration
  debounceMs: 1000,
  
  onStateChange: (state) => {
    console.log('State changed:', state);
  },
  
  onSaved: (data) => {
    console.log('Saved:', data);
  },
});

// Usage in event handlers
const nameInput = document.getElementById('name') as HTMLInputElement;

nameInput.addEventListener('input', () => {
  const item: Item = {
    id: '123',
    name: nameInput.value,
    version: 1,
  };
  
  // Auto-save with debounce
  manager.save(ENTITY.ITEM, item);
});

// Force save immediately
async function handleSaveClick() {
  const item: Item = {
    id: '123',
    name: nameInput.value,
    version: 1,
  };
  
  await manager.save(ENTITY.ITEM, item, { immediate: true });
  alert('保存しました');
}

