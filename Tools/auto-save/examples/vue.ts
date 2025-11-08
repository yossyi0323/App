/**
 * Vue.js 3 Composition API example
 */

import { ref, onUnmounted } from 'vue';
import { AutoSaveManager, SaveState, DEFAULT_DEBOUNCE_MS } from '../src';

interface InventoryItem {
  id: string;
  name: string;
  inventoryCount: number;
  version: number;
}

export function useAutoSave() {
  const saveState = ref<SaveState>(SaveState.IDLE);
  const saveMessage = ref('');
  
  // Create auto-save manager
  const autoSave = new AutoSaveManager<InventoryItem>({
    debounceMs: DEFAULT_DEBOUNCE_MS,
    
    saveFunction: async (data) => {
      // Call your API (axios, ofetch, etc.)
      const response = await fetch(`/api/inventory-status/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.status === 409) {
        throw new Error('Conflict');
      }
      
      if (!response.ok) {
        throw new Error('Save failed');
      }
      
      return await response.json();
    },
    
    callbacks: {
      onSaving: () => {
        saveState.value = SaveState.SAVING;
        saveMessage.value = '保存中...';
      },
      onSaved: () => {
        saveState.value = SaveState.SAVED;
        saveMessage.value = '保存しました';
        setTimeout(() => {
          saveMessage.value = '';
        }, 2000);
      },
      onError: (error) => {
        saveState.value = SaveState.ERROR;
        saveMessage.value = '保存エラー';
        console.error(error);
      },
      onConflict: () => {
        saveState.value = SaveState.CONFLICT;
        alert('他のユーザーが更新しました。ページをリロードしてください。');
      }
    }
  });
  
  // Cleanup on component unmount
  onUnmounted(async () => {
    if (autoSave.hasUnsavedChanges()) {
      await autoSave.forceSave();
    }
  });
  
  return {
    autoSave,
    saveState,
    saveMessage
  };
}

// Usage in Vue component:
/*
<script setup lang="ts">
import { useAutoSave } from './useAutoSave';

const { autoSave, saveState, saveMessage } = useAutoSave();
const item = ref({
  id: '1',
  name: 'じゃがいも',
  inventoryCount: 10,
  version: 5
});

function onCountChange(newCount: number) {
  item.value.inventoryCount = newCount;
  autoSave.update(item.value.id, item.value);
}
</script>

<template>
  <div>
    <input 
      type="number" 
      :value="item.inventoryCount"
      @input="onCountChange($event.target.value)"
    />
    <span>{{ saveMessage }}</span>
  </div>
</template>
*/


