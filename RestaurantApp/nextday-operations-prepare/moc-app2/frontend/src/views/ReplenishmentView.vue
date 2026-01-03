<template>

  <div>

    <h1 class="text-xl font-bold mb-4">{{ LABELS.REPLENISHMENT }}</h1>
     <DateSelector
      :date="selectedDate"
      @onDateChange="handleDateChange"
    />
    <div class="mb-3">
       <PlaceSelector
        :places="places"
        :selected-place-id="selectedPlaceId"
        @update:selectedPlaceId="handlePlaceChange"
        :type="getCode(PLACE_TYPE, 'SOURCE')"
        class="w-full"
      />
    </div>
     <ErrorMessage
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

      <p class="text-muted-foreground">
         {{ selectedPlaceId ? $msg(WARNING.W20010) : $msg(INFO.I30020) }}
      </p>

    </div>

    <div v-else>
       <!-- ヘッダー行 -->
      <div class="flex items-center px-2 py-2 border-b border-border text-sm mb-2 justify-between">

        <div class="flex gap-2 ml-2">
           <Badge
            :variant="allCleared ? 'secondary' : 'default'"
            class="text-xs font-normal px-2 py-0.5 align-middle"
            > {{ getDisplayName(REPLENISHMENT_STATUS, 'REQUIRED') }}{{ SYMBOLS.COLON
            }}{{ countRequired }}{{ SYMBOLS.SLASH }}{{ total }} </Badge
          >
        </div>
         <span class="text-xs mr-10"> {{ getDisplayName(REPLENISHMENT_STATUS, 'COMPLETED') }} </span
        >
      </div>
       <!-- 補充リスト（移動パターンのみ） --> <ReplenishItemCard
        v-for="viewModel in filteredItems"
        :key="viewModel.item.id"
        :item="viewModel.item"
        :date="format(selectedDate, 'yyyy-MM-dd')"
        :current-stock="getStatus(viewModel).inventoryCount ?? 0"
        :restock-amount="getStatus(viewModel).replenishmentCount ?? 0"
        :replenishment-status="
          toEnumCode(REPLENISHMENT_STATUS, getStatus(viewModel).replenishmentStatus)
        "
        :preparation-status="toEnumCode(PREPARATION_STATUS, getStatus(viewModel).preparationStatus)"
        :order-status="toEnumCode(ORDER_REQUEST_STATUS, getStatus(viewModel).orderRequestStatus)"
        :memo="getStatus(viewModel).replenishmentNote ?? ''"
        :is-checked="isItemConfirmed(viewModel.status)"
        :pattern-type="
          viewModel.item.patternType
            ? toEnumCode(PREPARATION_PATTERN, viewModel.item.patternType)
            : undefined
        "
        @stock-change="(v) => handleItemStatusChange(viewModel.item.id, 'inventoryCount', v)"
        @restock-change="(v) => handleItemStatusChange(viewModel.item.id, 'replenishmentCount', v)"
        @memo-change="(v) => handleItemStatusChange(viewModel.item.id, 'replenishmentNote', v)"
        @check-change="(checked) => handleCheckChange(viewModel.item.id, checked)"
        @order-request="() => handleOrderRequest(viewModel.item.id)"
        @preparation-status-change="
          (v) => handleItemStatusChange(viewModel.item.id, 'preparationStatus', v)
        "
        @needs-restock-change="(v) => handleNeedsRestockChange(viewModel.item.id, v)"
      />
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { format, parse } from 'date-fns';
import DateSelector from '@/components/DateSelector.vue';
import PlaceSelector from '@/components/PlaceSelector.vue';
import ReplenishItemCard from '@/components/replenishment/ReplenishItemCard.vue';
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue';
import ErrorMessage from '@/components/ui/ErrorMessage.vue';
import Badge from '@/components/ui/badge.vue';
import type { Place, InventoryStatus, InventoryStatusViewModel, Item } from '@/types';
import { PLACE_TYPE } from '@/lib/enums/place-type';
import {
  getCode,
  isEnumCode,
  getDisplayName,
  toEnumCode,
  type EnumCode,
} from '@/lib/utils/enum-utils';
import { ERROR, WARNING, INFO, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { INVENTORY_STATUS } from '@/lib/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/enums/order-request-status';
import { PREPARATION_PATTERN } from '@/lib/enums/preparation-pattern';
import { SYMBOLS } from '@/lib/constants/constants';
import { createInventoryStatusFromViewModel } from '@/lib/utils/inventory-status-utils';
import { useBusinessDateStore } from '@/stores/businessDate';
import { inventoryStatusApi } from '@/lib/api/inventory-status';
import { itemsApi } from '@/lib/api/items';
import { placesApi } from '@/lib/api/places';
import { useInventoryAutoSave } from '@/lib/composables/useInventoryAutoSave';

const businessDateStore = useBusinessDateStore();

const selectedDate = ref(parse(businessDateStore.businessDate, 'yyyy-MM-dd', new Date()));
const selectedPlaceId = ref<string | null>(null);
const places = ref<Place[]>([]);
const items = ref<InventoryStatusViewModel[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(true);

const { autoSave, saveState, saveMessage } = useInventoryAutoSave({
  items: items as Ref<InventoryStatusViewModel[]>,
  selectedPlaceId: selectedPlaceId as Ref<string | null>,
  selectedDate: selectedDate as Ref<Date>,
  onError: (errorMsg) => {
    error.value = errorMsg;
  },
});

// 移動パターンで、補充ステータスが要補充または補充済のものをフィルタ
const filteredItems = computed(() => {
  return items.value.filter((vm) => {
    const patternType = vm.item.patternType
      ? toEnumCode(PREPARATION_PATTERN, vm.item.patternType)
      : undefined;
    const isMove = patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'MOVE');
    if (!isMove) return false;

    const status = getStatus(vm);
    const replenishmentStatus = toEnumCode(REPLENISHMENT_STATUS, status.replenishmentStatus);
    return (
      isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED') ||
      isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'COMPLETED')
    );
  });
});

// 初期表示時に場所一覧を読み込む
onMounted(async () => {
  try {
    const data = await placesApi.getAll();
    places.value = data;
    const firstSource = data.find((place) => place.type === getCode(PLACE_TYPE, 'SOURCE'));
    if (firstSource) {
      selectedPlaceId.value = firstSource.id;
    }
  } catch (err: any) {
    error.value = $msg(ERROR.E10001, LABELS.LOCATION) + (err?.message ? `: ${err.message}` : '');
  } finally {
    isLoading.value = false;
  }
});

// 選択された場所が変更されたら品目と在庫ステータスを読み込む
watch(
  [selectedPlaceId, () => businessDateStore.businessDate],
  async () => {
    if (!selectedPlaceId.value) return;

    isLoading.value = true;
    try {
      const itemsData = await itemsApi.getBySource(selectedPlaceId.value!);
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
  },
  { immediate: true }
);

const handleDateChange = (date: Date) => {
  selectedDate.value = date;
  businessDateStore.setBusinessDate(format(date, 'yyyy-MM-dd'));
};

const handlePlaceChange = (placeId: string) => {
  selectedPlaceId.value = placeId;
};

function isItemConfirmed(status: InventoryStatus | null | undefined): boolean {
  const checkStatus = status?.inventoryCheckStatus ?? getCode(INVENTORY_STATUS, 'UNCONFIRMED');
  return isEnumCode(INVENTORY_STATUS, checkStatus, 'CONFIRMED');
}

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

const handleCheckChange = (itemId: string, checked: boolean) => {
  handleItemStatusChange(
    itemId,
    'inventoryCheckStatus',
    checked ? getCode(INVENTORY_STATUS, 'CONFIRMED') : getCode(INVENTORY_STATUS, 'UNCONFIRMED')
  );
};

const handleOrderRequest = (itemId: string) => {
  const viewModel = items.value.find((vm) => vm.item.id === itemId);
  if (!viewModel) return;

  const status = getStatus(viewModel);
  const currentOrderStatus = toEnumCode(ORDER_REQUEST_STATUS, status.orderRequestStatus);
  const newOrderStatus = isEnumCode(ORDER_REQUEST_STATUS, currentOrderStatus, 'NOT_REQUIRED')
    ? getCode(ORDER_REQUEST_STATUS, 'REQUIRED')
    : getCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED');

  handleItemStatusChange(itemId, 'orderRequestStatus', newOrderStatus);
};

const handleNeedsRestockChange = (itemId: string, checked: boolean) => {
  handleItemStatusChange(
    itemId,
    'replenishmentStatus',
    checked ? getCode(REPLENISHMENT_STATUS, 'REQUIRED') : getCode(REPLENISHMENT_STATUS, 'COMPLETED')
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
  return filteredItems.value.filter((vm) => {
    const status = getStatus(vm);
    return isEnumCode(
      REPLENISHMENT_STATUS,
      toEnumCode(REPLENISHMENT_STATUS, status.replenishmentStatus),
      'REQUIRED'
    );
  }).length;
});
const allCleared = computed(() => countRequired.value === 0 || total.value === 0);
</script>

