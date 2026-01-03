<template>
   <Card class="mb-3 overflow-hidden relative bg-background"
    >
    <div class="pt-2 pb-2 pl-4 pr-4 relative z-20">
       <!-- 1行目：チェックボックス・品名・ラジオ・トグル -->
      <div class="flex items-center gap-2 flex-wrap mb-2">
         <!-- 未確認・確認済チェックボックス --> <Checkbox
          :checked="isChecked"
          @update:checked="onCheckChange"
          class="h-5 w-5"
          :disabled="isRestocked"
        /> <!-- 品物名 --> <span class="flex-1 text-sm font-medium break-words min-w-[120px]"
          > {{ item.name }} </span
        > <!-- 要補充トグルスイッチ -->
        <div class="flex flex-col items-center gap-1">
           <Switch
            :checked="isNeedsRestock"
            @update:checked="handleNeedsRestockChange"
            class="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
            :disabled="isRestocked"
          />
        </div>
         <!-- メモトグル --> <button
          type="button"
          class="flex items-center justify-center w-6 h-9 rounded"
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
       <!-- 2行目：在庫数・補充数（トグルON時のみ） -->
      <div
        v-if="isMemoOpen"
        class="flex gap-2"
      >

        <div class="flex flex-col flex-1">
           <label
            :for="`stock-${item.id}`"
            class="text-xs"
            > {{ LABELS.CURRENT_STOCK }} </label
          > <Input
            :id="`stock-${item.id}`"
            type="number"
            :value="currentStock === 0 ? '' : currentStock"
            @input="handleStockChange"
            min="0"
            class="h-9 w-full text-right text-base"
            :placeholder="NUMBER_PLACEHOLDER.STOCK"
          />
        </div>

        <div class="flex flex-col flex-1">
           <label
            :for="`restock-${item.id}`"
            class="text-xs"
            > {{ LABELS.REPLENISHMENT_COUNT }} </label
          > <Input
            :id="`restock-${item.id}`"
            type="number"
            :value="restockAmount === 0 ? '' : restockAmount"
            @input="handleRestockChange"
            min="0"
            class="h-9 w-full text-right text-base"
            :placeholder="NUMBER_PLACEHOLDER.RESTOCK"
          />
        </div>

      </div>
       <!-- 3行目：メモ欄（トグルON時のみ） -->
      <div v-if="isMemoOpen">
         <label
          :for="`memo-${item.id}`"
          class="text-xs"
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
     </Card
  >
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from '@/components/ui/card.vue';
import Checkbox from '@/components/ui/checkbox.vue';
import Switch from '@/components/ui/switch.vue';
import Input from '@/components/ui/input.vue';
import Textarea from '@/components/ui/textarea.vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import type { Item } from '@/types';
import { REPLENISHMENT_STATUS } from '@/lib/enums/replenishment-status';
import { isEnumCode } from '@/lib/utils/enum-utils';
import type { EnumCode } from '@/lib/utils/enum-utils';
import { LABELS } from '@/lib/constants/labels';
import { NUMBER_PLACEHOLDER } from '@/lib/constants/constants';

interface InventoryItemCardProps {
  item: Item;
  date: string;
  currentStock: number;
  restockAmount: number;
  replenishmentStatus: EnumCode<typeof REPLENISHMENT_STATUS>;
  memo: string;
  isChecked: boolean;
  onStockChange: (value: number) => void;
  onRestockChange: (value: number) => void;
  onNeedsRestockChange: (value: boolean) => void;
  onMemoChange: (value: string) => void;
  onCheckChange: (value: boolean) => void;
}

const props = defineProps<InventoryItemCardProps>();

const isMemoOpen = ref(props.currentStock !== 0 || props.restockAmount !== 0 || props.memo !== '');

const isRestocked = computed(() =>
  isEnumCode(REPLENISHMENT_STATUS, props.replenishmentStatus, 'COMPLETED')
);
const isNeedsRestock = computed(
  () => !isEnumCode(REPLENISHMENT_STATUS, props.replenishmentStatus, 'NOT_REQUIRED')
);

const handleStockChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value === '' ? 0 : Number(target.value);
  props.onStockChange(value);
};

const handleRestockChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value === '' ? 0 : Number(target.value);
  props.onRestockChange(value);
};

const handleNeedsRestockChange = (checked: boolean | 'indeterminate') => {
  props.onNeedsRestockChange(checked === true);
};

const handleMemoChange = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  props.onMemoChange(target.value);
};
</script>

