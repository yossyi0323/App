<template>

  <div>

    <h1 class="text-xl font-bold mb-4">{{ LABELS.ORDER_REQUEST }}</h1>
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

    <div
      v-else-if="filteredItems.length === 0"
      class="py-8 text-center"
    >

      <p class="text-muted-foreground"> {{ $msg(INFO.I30020) }} </p>

    </div>

    <div v-else>
       <!-- ヘッダー行 -->
      <div class="flex items-center px-2 py-2 border-b border-border text-sm mb-2 justify-between">

        <div class="flex gap-2 ml-2">
           <Badge
            :variant="allCleared ? 'secondary' : 'default'"
            class="text-xs font-normal px-2 py-0.5 align-middle"
            > {{ getDisplayName(ORDER_REQUEST_STATUS, 'REQUIRED') }}{{ SYMBOLS.COLON
            }}{{ countRequired }}{{ SYMBOLS.SLASH }}{{ total }} </Badge
          >
        </div>
         <span class="text-xs mr-7">{{ LABELS.ORDER_REQUEST }}</span
        >
      </div>
       <!-- 発注依頼リスト（発注依頼ステータスが不要以外） --> <OrderItemCard
        v-for="viewModel in filteredItems"
        :key="viewModel.item.id"
        :item="viewModel.item"
        :current-stock="getStatus(viewModel).inventoryCount ?? 0"
        :restock-amount="getStatus(viewModel).replenishmentCount ?? 0"
        :order-status="toEnumCode(ORDER_REQUEST_STATUS, getStatus(viewModel).orderRequestStatus)"
        :memo="getStatus(viewModel).replenishmentNote ?? ''"
        @memo-change="(v) => handleItemStatusChange(viewModel.item.id, 'replenishmentNote', v)"
        @order-request-change="(v) => handleOrderRequestChange(viewModel.item.id, v)"
      />
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { format, parse } from 'date-fns';
import DateSelector from '@/components/DateSelector.vue';
import OrderItemCard from '@/components/order/OrderItemCard.vue';
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue';
import ErrorMessage from '@/components/ui/ErrorMessage.vue';
import Badge from '@/components/ui/badge.vue';
import type { InventoryStatus, InventoryStatusViewModel, Item } from '@/types';
import {
  getCode,
  isEnumCode,
  getDisplayName,
  toEnumCode,
  type EnumCode,
} from '@/lib/utils/enum-utils';
import { ERROR, INFO, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { ORDER_REQUEST_STATUS } from '@/lib/enums/order-request-status';
import { SYMBOLS, ALL_SOURCE_PLACES } from '@/lib/constants/constants';
import { createInventoryStatusFromViewModel } from '@/lib/utils/inventory-status-utils';
import { useBusinessDateStore } from '@/stores/businessDate';
import { inventoryStatusApi } from '@/lib/api/inventory-status';
import { itemsApi } from '@/lib/api/items';
import { useInventoryAutoSave } from '@/lib/composables/useInventoryAutoSave';

const businessDateStore = useBusinessDateStore();

const selectedDate = ref(parse(businessDateStore.businessDate, 'yyyy-MM-dd', new Date()));
const items = ref<InventoryStatusViewModel[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(true);

const { autoSave, saveState, saveMessage } = useInventoryAutoSave({
  items: items as Ref<InventoryStatusViewModel[]>,
  selectedPlaceId: ref(ALL_SOURCE_PLACES.KEY) as Ref<string | null>, // 全場所分取得
  selectedDate: selectedDate as Ref<Date>,
  onError: (errorMsg) => {
    error.value = errorMsg;
  },
});

// 発注依頼ステータスが不要以外（要発注依頼・発注依頼済）をフィルタ
const filteredItems = computed(() => {
  return items.value.filter((vm) => {
    const status = getStatus(vm);
    return !isEnumCode(
      ORDER_REQUEST_STATUS,
      toEnumCode(ORDER_REQUEST_STATUS, status.orderRequestStatus),
      'NOT_REQUIRED'
    );
  });
});

// 初期表示時に全品目と在庫ステータスを読み込む
onMounted(async () => {
  isLoading.value = true;
  try {
    const itemsData = await itemsApi.getAll();
    const statuses = await inventoryStatusApi.getByDate(businessDateStore.businessDate);
    items.value =
      itemsData?.map((item) => {
        const existingStatus = statuses?.find(
          (status) => status.itemId === item.id || status.item?.id === item.id
        );
        return {
          item,
          status: existingStatus || null,
        };
      }) || [];
  } catch (err: any) {
    error.value = $msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : '');
  } finally {
    isLoading.value = false;
  }
});

// 業務日付が変更されたら在庫ステータスを再読み込み
watch(
  () => businessDateStore.businessDate,
  async () => {
    isLoading.value = true;
    try {
      const statuses = await inventoryStatusApi.getByDate(businessDateStore.businessDate);
      items.value = items.value.map((vm) => {
        const existingStatus = statuses?.find(
          (status) => status.itemId === vm.item.id || status.item?.id === vm.item.id
        );
        return {
          ...vm,
          status: existingStatus || null,
        };
      });
    } catch (err: any) {
      error.value = $msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : '');
    } finally {
      isLoading.value = false;
    }
  }
);

const handleDateChange = (date: Date) => {
  selectedDate.value = date;
  businessDateStore.setBusinessDate(format(date, 'yyyy-MM-dd'));
};

function updateItemStatus(
  items: InventoryStatusViewModel[],
  itemId: string,
  field: keyof InventoryStatus,
  value: InventoryStatus[keyof InventoryStatus],
  date: Date
): InventoryStatusViewModel[] {
  return items.map((viewModel) => {
    if (viewModel.item.id !== itemId) return viewModel;
    return {
      ...viewModel,
      status: createInventoryStatusFromViewModel(viewModel, date, { [field]: value }),
    };
  });
}

const handleOrderRequestChange = (itemId: string, checked: boolean) => {
  handleItemStatusChange(
    itemId,
    'orderRequestStatus',
    checked ? getCode(ORDER_REQUEST_STATUS, 'REQUESTED') : getCode(ORDER_REQUEST_STATUS, 'REQUIRED')
  );
};

const handleItemStatusChange = (
  itemId: string,
  field: keyof InventoryStatus,
  value: InventoryStatus[keyof InventoryStatus]
) => {
  items.value = updateItemStatus(items.value, itemId, field, value, selectedDate.value);
};

const getStatus = (viewModel: InventoryStatusViewModel): InventoryStatus => {
  return createInventoryStatusFromViewModel(viewModel, selectedDate.value);
};

const total = computed(() => filteredItems.value.length);
const countRequired = computed(() => {
  return items.value.filter((vm) => {
    const status = getStatus(vm);
    return isEnumCode(
      ORDER_REQUEST_STATUS,
      toEnumCode(ORDER_REQUEST_STATUS, status.orderRequestStatus),
      'REQUIRED'
    );
  }).length;
});
const allCleared = computed(() => countRequired.value === 0 || total.value === 0);
</script>

