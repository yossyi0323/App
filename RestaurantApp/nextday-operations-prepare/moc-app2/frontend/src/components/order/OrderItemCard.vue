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
              variant="secondary"
              class="text-xs font-normal px-2 py-0.5 align-middle"
              > {{ LABELS.REPLENISHMENT_COUNT }}{{ SYMBOLS.COLON }}{{ restockAmount }} </Badge
            > </span
          >
        </div>
         <!-- 右端：発注依頼チェック＋メモトグル -->
        <div class="flex-shrink-0 ml-2 flex items-center gap-2">
           <!-- 発注依頼チェックボックス -->
          <div class="flex items-center gap-1">
             <Checkbox
              :checked="isOrderRequested"
              @update:checked="handleOrderRequestChange"
              class="h-5 w-5"
            />
          </div>
           <!-- メモトグル --> <button
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
        class="mt-2"
      >

        <div class="flex flex-col">
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
import Textarea from '@/components/ui/textarea.vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import type { Item } from '@/types';
import { ORDER_REQUEST_STATUS } from '@/lib/enums/order-request-status';
import { isEnumCode } from '@/lib/utils/enum-utils';
import type { EnumCode } from '@/lib/utils/enum-utils';
import { LABELS } from '@/lib/constants/labels';
import { SYMBOLS } from '@/lib/constants/constants';

interface OrderItemCardProps {
  item: Item;
  currentStock: number;
  restockAmount: number;
  orderStatus: EnumCode<typeof ORDER_REQUEST_STATUS>;
  memo: string;
  onMemoChange: (value: string) => void;
  onOrderRequestChange: (value: boolean) => void;
}

const props = defineProps<OrderItemCardProps>();

const getShouldOpenMemo = () => props.memo !== '';

const isMemoOpen = ref(getShouldOpenMemo());

const handleMemoChange = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  props.onMemoChange(target.value);
};

const isOrderRequested = computed(() =>
  isEnumCode(ORDER_REQUEST_STATUS, props.orderStatus, 'REQUESTED')
);

const handleOrderRequestChange = (checked: boolean | 'indeterminate') => {
  props.onOrderRequestChange(checked === true);
};
</script>

