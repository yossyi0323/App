<template>

  <div>

    <h1 class="text-xl font-bold mb-4">営業準備状況</h1>
     <DateSelector
      :date="selectedDate"
      @onDateChange="handleDateChange"
    /> <ErrorMessage
      v-if="error"
      :message="error"
      class="mb-4"
    />
    <div
      v-if="isLoading"
      class="flex items-center justify-center min-h-[40vh]"
    >
       <LoadingIndicator />
    </div>

    <div v-else>
       <StatusOverview
        :date="businessDateStore.businessDate"
        :items="items"
        :inventoryStatuses="inventoryStatuses"
      />
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { format, parse } from 'date-fns';
import DateSelector from '@/components/DateSelector.vue';
import StatusOverview from '@/components/status/StatusOverview.vue';
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue';
import ErrorMessage from '@/components/ui/ErrorMessage.vue';
import type { Item, InventoryStatus } from '@/types';
import { useBusinessDateStore } from '@/stores/businessDate';
import { inventoryStatusApi } from '@/lib/api/inventory-status';
import { itemsApi } from '@/lib/api/items';

const businessDateStore = useBusinessDateStore();

const selectedDate = ref(parse(businessDateStore.businessDate, 'yyyy-MM-dd', new Date()));
const items = ref<Item[]>([]);
const inventoryStatuses = ref<InventoryStatus[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(true);

// 初期表示時に全品目を読み込む
onMounted(async () => {
  try {
    const itemsData = await itemsApi.getAll();
    items.value = itemsData || [];
  } catch (err: any) {
    error.value = '商品の読み込み中にエラーが発生しました: ' + (err?.message || '');
  } finally {
    isLoading.value = false;
  }
});

// 業務日付または品目が変更されたら在庫ステータスを読み込む
watch(
  [() => businessDateStore.businessDate, () => items.value.length],
  async () => {
    if (items.value.length === 0) return;

    try {
      const statuses = await inventoryStatusApi.getByDate(businessDateStore.businessDate);
      inventoryStatuses.value = statuses || [];
    } catch (err: any) {
      error.value = '在庫状況の読み込み中にエラーが発生しました: ' + (err?.message || '');
    }
  },
  { immediate: true }
);

const handleDateChange = (date: Date) => {
  selectedDate.value = date;
  businessDateStore.setBusinessDate(format(date, 'yyyy-MM-dd'));
};
</script>

