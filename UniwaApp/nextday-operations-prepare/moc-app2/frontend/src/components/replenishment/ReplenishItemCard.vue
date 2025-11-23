<template>
   <Card class="mb-3 overflow-hidden relative bg-background"
    >
    <div class="p-4 relative z-20">

      <div class="flex items-center gap-2 w-full">
         <!-- 品物名＋在庫数・補充数バッジ（中央） -->
        <div class="flex-1 min-w-0 inline-flex flex-wrap">
           <span class="block text-sm font-medium break-words whitespace-normal"
            > {{ item.name }} </span
          > <span class="flex flex-row flex-wrap gap-2 mx-1 my-1"
            > <Badge
              v-if="currentStock"
              variant="secondary"
              class="text-xs font-normal px-2 py-0.5 align-middle"
              > {{ LABELS.CURRENT_STOCK }}{{ SYMBOLS.COLON }}{{ currentStock }} </Badge
            > <Badge
              v-if="restockAmount"
              variant="default"
              class="text-xs font-normal px-2 py-0.5 align-middle"
              > {{ LABELS.REPLENISHMENT_COUNT }}{{ SYMBOLS.COLON }}{{ restockAmount }} </Badge
            > </span
          >
        </div>
         <!-- 右端：トグルボタン＋メモトグル -->
        <div class="flex-shrink-0 ml-2 flex items-center gap-2">
           <!-- 補充済チェックボックス -->
          <div
            v-if="patternType && isMove"
            class="flex items-center gap-1"
          >
             <Checkbox
              :checked="!isNeedsRestock"
              @update:checked="handleNeedsRestockChange"
              class="h-5 w-5"
            />
          </div>
           <Select
            v-if="patternType && isCreation"
            :model-value="preparationStatus"
            @update:model-value="onPreparationStatusChange"
            > <SelectTrigger
              :class="`w-[90px] h-7 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none flex items-center justify-between ${isCreationRequired ? highlightClass : ''}`"
              > <SelectValue :placeholder="LABELS.PREPARATION_STATUS" /> </SelectTrigger
            > <SelectContent
              > <SelectItem :value="getCodeAsEnumCode(PREPARATION_STATUS, 'REQUIRED')"
                > {{ getDisplayName(PREPARATION_STATUS, 'REQUIRED') }} </SelectItem
              > <SelectItem :value="getCodeAsEnumCode(PREPARATION_STATUS, 'REQUESTED')"
                > {{ LABELS.REQUESTED }} </SelectItem
              > <SelectItem :value="getCodeAsEnumCode(PREPARATION_STATUS, 'COMPLETED')"
                > {{ getDisplayName(PREPARATION_STATUS, 'COMPLETED') }} </SelectItem
              > </SelectContent
            > </Select
          > <!-- メモトグル --> <button
            type="button"
            class="flex items-center justify-center w-6 h-6 rounded"
            @click="isMemoOpen = !isMemoOpen"
            tabindex="-1"
            :aria-label="LABELS.TOGGLE_MEMO"
          >
             <ChevronDown
              v-if="!isMemoOpen"
              class="h-5 w-5"
            /> <ChevronUp
              v-else
              class="h-5 w-5"
            /> </button
          >
        </div>

      </div>
       <!-- メモ欄 -->
      <div
        v-if="isMemoOpen"
        class="mt-2 flex flex-row items-start gap-2"
      >
         <!-- 発注依頼チェックボックス（縦並び・中央揃え） -->
        <div class="flex flex-col items-center flex-shrink-0 gap-1">
           <label class="text-xs">{{ LABELS.ORDER }}</label
          > <Checkbox
            :checked="isOrderRequired"
            @update:checked="onOrderRequest"
            class="h-5 w-5"
          />
        </div>

        <div class="flex flex-col flex-1">
           <label
            :for="`memo-${item.id}`"
            class="text-xs mb-1 ml-1"
            > {{ LABELS.MEMO }} </label
          > <Textarea
            :id="`memo-${item.id}`"
            :value="memo"
            @input="handleMemoChange"
            class="w-full rounded border border-gray-300 bg-background text-base p-2"
            placeholder=""
          />
        </div>

      </div>

    </div>
     </Card
  >
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from '@/components/ui/card.vue';
import Checkbox from '@/components/ui/checkbox.vue';
import Badge from '@/components/ui/badge.vue';
import Select from '@/components/ui/select.vue';
import SelectTrigger from '@/components/ui/select-trigger.vue';
import SelectContent from '@/components/ui/select-content.vue';
import SelectItem from '@/components/ui/select-item.vue';
import SelectValue from '@/components/ui/select-value.vue';
import Textarea from '@/components/ui/textarea.vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import type { Item } from '@/types';
import { REPLENISHMENT_STATUS } from '@/lib/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/enums/order-request-status';
import { PREPARATION_PATTERN } from '@/lib/enums/preparation-pattern';
import { isEnumCode, getCodeAsEnumCode, getDisplayName } from '@/lib/utils/enum-utils';
import type { EnumCode } from '@/lib/utils/enum-utils';
import { LABELS } from '@/lib/constants/labels';
import { SYMBOLS } from '@/lib/constants/constants';

interface ReplenishItemCardProps {
  item: Item;
  date: string;
  currentStock: number;
  restockAmount: number;
  replenishmentStatus: EnumCode<typeof REPLENISHMENT_STATUS>;
  preparationStatus: EnumCode<typeof PREPARATION_STATUS>;
  orderStatus: EnumCode<typeof ORDER_REQUEST_STATUS>;
  memo: string;
  isChecked: boolean;
  patternType?: EnumCode<typeof PREPARATION_PATTERN>;
}

const props = defineProps<ReplenishItemCardProps>();

const emit = defineEmits<{
  (e: 'stock-change', value: number): void;
  (e: 'restock-change', value: number): void;
  (e: 'memo-change', value: string): void;
  (e: 'check-change', value: boolean): void;
  (e: 'needs-restock-change', value: boolean): void;
  (e: 'order-request'): void;
  (e: 'preparation-status-change', value: EnumCode<typeof PREPARATION_STATUS>): void;
}>();

const getShouldOpenMemo = () =>
  isEnumCode(ORDER_REQUEST_STATUS, props.orderStatus, 'REQUIRED') || props.memo !== '';

const isMemoOpen = ref(getShouldOpenMemo());

const handleMemoChange = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('memo-change', target.value);
};

const isCreationRequired = computed(() =>
  isEnumCode(PREPARATION_STATUS, props.preparationStatus, 'REQUIRED')
);
const isOrderRequired = computed(() =>
  isEnumCode(ORDER_REQUEST_STATUS, props.orderStatus, 'REQUIRED')
);
const highlightClass = computed(() =>
  isCreationRequired.value || isOrderRequired.value
    ? 'bg-black text-white dark:bg-white dark:text-black'
    : ''
);

const isNeedsRestock = computed(() =>
  isEnumCode(REPLENISHMENT_STATUS, props.replenishmentStatus, 'REQUIRED')
);

const isMove = computed(
  () => props.patternType && isEnumCode(PREPARATION_PATTERN, props.patternType, 'MOVE')
);

const isCreation = computed(
  () => props.patternType && isEnumCode(PREPARATION_PATTERN, props.patternType, 'CREATION')
);

const handleNeedsRestockChange = (checked: boolean | 'indeterminate') => {
  emit('needs-restock-change', !(checked === true));
};

const onPreparationStatusChange = (value: EnumCode<typeof PREPARATION_STATUS>) => {
  emit('preparation-status-change', value);
};

const onOrderRequest = () => {
  emit('order-request');
};
</script>

