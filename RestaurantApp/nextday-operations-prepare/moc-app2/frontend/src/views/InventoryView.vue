<template>

  <div>

    <h1 class="text-xl font-bold mb-4">{{ LABELS.INVENTORY_CHECK }}</h1>
     <DateSelector
      :date="selectedDate"
      @onDateChange="handleDateChange"
    />
    <div class="mb-3">
       <PlaceSelector
        :places="places"
        :selected-place-id="selectedPlaceId"
        @update:selectedPlaceId="handlePlaceChange"
        :type="getCode(PLACE_TYPE, 'DESTINATION')"
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
      v-else-if="items.length === 0"
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
           <button
            type="button"
            class="pl-2 rounded-full transition-colors"
            @click="handleCheckChangeAll"
          >
             <Check class="h-6 w-6" /> </button
          > <Badge
            :variant="allCleared ? 'secondary' : 'default'"
            class="text-xs font-normal px-2 py-0.5 align-middle"
            > {{ getDisplayName(REPLENISHMENT_STATUS, 'REQUIRED') }}{{ SYMBOLS.COLON
            }}{{ countRequired }} </Badge
          >
        </div>
         <span class="text-xs mr-8"> {{ getDisplayName(REPLENISHMENT_STATUS, 'REQUIRED') }} </span>
      </div>
       <!-- 在庫リスト -->
      <div
        v-for="viewModel in items"
        :key="viewModel.item.id"
      >
         <InventoryItemCard
          :item="viewModel.item"
          :date="format(selectedDate, 'yyyy-MM-dd')"
          :current-stock="getStatus(viewModel).inventoryCount ?? 0"
          :restock-amount="getStatus(viewModel).replenishmentCount ?? 0"
          :replenishment-status="
            (getStatus(viewModel).replenishmentStatus ?? '99') as EnumCode<
              typeof REPLENISHMENT_STATUS
            >
          "
          :memo="getStatus(viewModel).replenishmentNote ?? ''"
          :is-checked="isItemConfirmed(viewModel.status)"
          @stock-change="(v) => handleItemStatusChange(viewModel.item.id, 'inventoryCount', v)"
          @restock-change="
            (v) => handleItemStatusChange(viewModel.item.id, 'replenishmentCount', v)
          "
          @needs-restock-change="
            (checked) => {
              handleItemStatusChange(viewModel.item.id, 'replenishmentStatus', isRequired(checked));
              handleItemStatusChange(
                viewModel.item.id,
                'preparationStatus',
                getNextPreparationStatus(
                  checked,
                  getStatus(viewModel).preparationStatus as EnumCode<typeof PREPARATION_STATUS>
                )
              );
            }
          "
          @memo-change="(v) => handleItemStatusChange(viewModel.item.id, 'replenishmentNote', v)"
          @check-change="(checked) => handleCheckChange(viewModel.item.id, checked)"
        />
      </div>

    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { format, parse } from 'date-fns';
import DateSelector from '@/components/DateSelector.vue';
import PlaceSelector from '@/components/PlaceSelector.vue';
import InventoryItemCard from '@/components/inventory/InventoryItemCard.vue';
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue';
import ErrorMessage from '@/components/ui/ErrorMessage.vue';
import Badge from '@/components/ui/badge.vue';
import { Check } from 'lucide-vue-next';
import type { Place, InventoryStatus, InventoryStatusViewModel, Item } from '@/types';
import { PLACE_TYPE } from '@/lib/enums/place-type';
import { getCode, isEnumCode, getDisplayName, type EnumCode } from '@/lib/utils/enum-utils';
import { ERROR, WARNING, INFO, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { INVENTORY_STATUS } from '@/lib/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/enums/preparation-status';
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

// 初期表示時に場所一覧を読み込む
onMounted(async () => {
  try {
    const data = await placesApi.getAll();
    places.value = data;
    const firstDestination = data.find(
      (place) => place.type === getCode(PLACE_TYPE, 'DESTINATION')
    );
    if (firstDestination) {
      selectedPlaceId.value = firstDestination.id;
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
      const itemsData = await itemsApi.getByPlace(selectedPlaceId.value);
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

function isRequired(checked: boolean): EnumCode<typeof REPLENISHMENT_STATUS> {
  return checked
    ? getCode(REPLENISHMENT_STATUS, 'REQUIRED')
    : getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED');
}

function getNextPreparationStatus(
  checked: boolean,
  prevPreparationStatus: EnumCode<typeof PREPARATION_STATUS>
): EnumCode<typeof PREPARATION_STATUS> {
  if (checked) {
    if (isEnumCode(PREPARATION_STATUS, prevPreparationStatus, 'NOT_REQUIRED')) {
      return getCode(PREPARATION_STATUS, 'REQUIRED');
    }
    return prevPreparationStatus;
  } else {
    if (isEnumCode(PREPARATION_STATUS, prevPreparationStatus, 'REQUIRED')) {
      return getCode(PREPARATION_STATUS, 'NOT_REQUIRED');
    }
    return prevPreparationStatus;
  }
}

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

const handleCheckChangeAll = () => {
  const isAllConfirmed = items.value.every((viewModel) => isItemConfirmed(viewModel.status));
  const isConfirmed = !isAllConfirmed;
  items.value.forEach((viewModel) => {
    handleCheckChange(viewModel.item.id, isConfirmed);
  });
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

const countRequired = computed(() => {
  return items.value.filter((vm) => {
    const status = createInventoryStatusFromViewModel(vm, selectedDate.value);
    return isEnumCode(REPLENISHMENT_STATUS, status.replenishmentStatus, 'REQUIRED');
  }).length;
});

const allCleared = computed(() => countRequired.value === 0 || items.value.length === 0);
</script>

