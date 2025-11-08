/**
 * Vanilla JavaScript/TypeScript example
 */

import { AutoSaveManager, SaveState, ConflictError, DEFAULT_DEBOUNCE_MS } from '../src';

interface InventoryItem {
  id: string;
  name: string;
  inventoryCount: number;
  version: number;
}

// Create auto-save manager
const autoSave = new AutoSaveManager<InventoryItem>({
  debounceMs: DEFAULT_DEBOUNCE_MS, // 1 second
  
  // Save function
  saveFunction: async (data) => {
    const response = await fetch(`/api/inventory-status/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.status === 409) {
      throw new ConflictError();
    }
    
    if (!response.ok) {
      throw new Error('Save failed');
    }
    
    return await response.json();
  },
  
  // Callbacks
  callbacks: {
    onSaving: () => {
      document.getElementById('save-status')!.textContent = '保存中...';
    },
    onSaved: () => {
      document.getElementById('save-status')!.textContent = '保存しました';
      setTimeout(() => {
        document.getElementById('save-status')!.textContent = '';
      }, 2000);
    },
    onError: (error) => {
      document.getElementById('save-status')!.textContent = '保存エラー';
      console.error(error);
    },
    onConflict: () => {
      alert('他のユーザーが更新しました。ページをリロードしてください。');
    }
  }
});

// When user changes data
function onInputChange(itemId: string, newCount: number, currentItem: InventoryItem) {
  const updatedItem: InventoryItem = {
    ...currentItem,
    inventoryCount: newCount
  };
  
  // This triggers auto-save (debounced)
  autoSave.update(itemId, updatedItem);
}

// Before page unload
window.addEventListener('beforeunload', async (e) => {
  if (autoSave.hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '';
    
    // Try to save before leaving
    await autoSave.forceSave();
  }
});

// Example usage
const sampleItem: InventoryItem = {
  id: '1',
  name: 'じゃがいも',
  inventoryCount: 10,
  version: 5
};

// User changes inventory count
onInputChange('1', 15, sampleItem);
// → Auto-saves after 1 second


