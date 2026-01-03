import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { inventoryStatusApi } from '@/services/api';
import type { InventoryStatus } from '@/types';

export const useInventoryStatusStore = defineStore('inventoryStatus', () => {
  const inventoryStatuses = ref<InventoryStatus[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pendingItems = computed(() =>
    inventoryStatuses.value.filter(
      (status) =>
        status.inventoryCheckStatus === '未確認' ||
        status.replenishmentStatus === '要補充' ||
        status.preparationStatus === '要作成' ||
        status.orderRequestStatus === '要発注依頼'
    )
  );

  const fetchInventoryStatusByDate = async (businessDate: string) => {
    loading.value = true;
    error.value = null;
    try {
      inventoryStatuses.value = await inventoryStatusApi.getByDate(businessDate);
    } catch (err) {
      error.value = '在庫状況データの取得に失敗しました';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateInventoryStatus = async (inventoryStatus: Partial<InventoryStatus>) => {
    try {
      if (inventoryStatus.id) {
        const updatedStatus = await inventoryStatusApi.update(inventoryStatus.id, inventoryStatus);
        const index = inventoryStatuses.value.findIndex((s) => s.id === inventoryStatus.id);
        if (index !== -1) {
          inventoryStatuses.value[index] = updatedStatus;
        }
        return updatedStatus;
      } else {
        const newStatus = await inventoryStatusApi.create(inventoryStatus);
        inventoryStatuses.value.push(newStatus);
        return newStatus;
      }
    } catch (err) {
      error.value = '在庫状況の更新に失敗しました';
      console.error(err);
      throw err;
    }
  };

  const getInventoryStatusByItemId = (itemId: string) => {
    return inventoryStatuses.value.find((status) => status.itemId === itemId);
  };

  return {
    inventoryStatuses,
    loading,
    error,
    pendingItems,
    fetchInventoryStatusByDate,
    updateInventoryStatus,
    getInventoryStatusByItemId,
  };
});
