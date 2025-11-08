/**
 * Vue 3 Composition API example
 */

import { ref, onMounted } from 'vue';
import { createReactiveManager } from '../src';

const ENTITY = {
  ITEM: 'item',
} as const;

interface Item {
  id: string;
  name: string;
  version: number;
}

export function useItemManager() {
  const manager = createReactiveManager();
  const item = ref<Item>({
    id: '123',
    name: '',
    version: 1,
  });
  const saveStatus = ref('');

  onMounted(() => {
    // Register entity
    manager.register<Item>(ENTITY.ITEM, {
      baseUrl: '/api/items',
      debounceMs: 1000,
      
      onStateChange: (state) => {
        if (state === 'saving') {
          saveStatus.value = '保存中...';
        } else if (state === 'saved') {
          saveStatus.value = '保存しました';
          setTimeout(() => {
            saveStatus.value = '';
          }, 2000);
        }
      },
    });
  });

  // Save item (with auto-save debounce)
  const saveItem = () => {
    manager.save(ENTITY.ITEM, item.value);
  };

  // Force save immediately
  const forceSave = async () => {
    await manager.save(ENTITY.ITEM, item.value, { immediate: true });
  };

  return {
    item,
    saveStatus,
    saveItem,
    forceSave,
  };
}

// Usage in Vue component:
/*
<template>
  <div>
    <input v-model="item.name" @input="saveItem" />
    <button @click="forceSave">即座に保存</button>
    <span>{{ saveStatus }}</span>
  </div>
</template>

<script setup lang="ts">
import { useItemManager } from './useItemManager';

const { item, saveStatus, saveItem, forceSave } = useItemManager();
</script>
*/

