<template>
  <v-card elevation="2" class="replenish-item-card">
    <v-card-title class="text-subtitle1">
      {{ inventoryStatus.item?.name || '品物名不明' }}
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-text-field
            :model-value="inventoryStatus.inventoryCount || 0"
            label="在庫数"
            type="number"
            variant="outlined"
            density="compact"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            :model-value="inventoryStatus.replenishmentCount || 0"
            label="補充数"
            type="number"
            variant="outlined"
            density="compact"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="localReplenishmentNote"
            label="補充メモ"
            variant="outlined"
            density="compact"
            rows="2"
            placeholder="補充に関するメモを入力してください"
            @input="onNoteChange"
            @blur="onBlur"
          ></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-checkbox
            v-model="localIsCompleted"
            label="補充完了"
            color="success"
            @change="onCompletedChange"
          ></v-checkbox>
        </v-col>
      </v-row>

      <v-row v-if="isInsufficient">
        <v-col cols="12">
          <v-alert type="warning" variant="outlined" density="compact">
            補充元の在庫が不足しています
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="hasChanges">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="text"
        size="small"
        @click="saveChanges"
      >
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InventoryStatus } from '@/types'
import { REPLENISHMENT_STATUS } from '@/types'

interface Props {
  inventoryStatus: InventoryStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [status: Partial<InventoryStatus>]
}>()

// ローカル状態
const localReplenishmentNote = ref<string>(props.inventoryStatus.replenishmentNote || '')
const localIsCompleted = ref<boolean>(props.inventoryStatus.replenishmentStatus === '補充済')

// 変更検知
const hasChanges = ref<boolean>(false)

// 在庫不足チェック
const isInsufficient = computed(() => {
  const inventoryCount = props.inventoryStatus.inventoryCount || 0
  const replenishmentCount = props.inventoryStatus.replenishmentCount || 0
  return inventoryCount < replenishmentCount
})

// 変更検知のためのウォッチャー
watch([
  localReplenishmentNote,
  localIsCompleted
], () => {
  hasChanges.value = true
}, { deep: true })

const onNoteChange = () => {
  // メモ変更時の処理
}

const onCompletedChange = (value: boolean) => {
  if (value) {
    // 補充完了時は補充数を0に設定
    // 実際の実装では、在庫数の更新も必要
  }
}

const onBlur = () => {
  // フォーカスが外れたときの処理（自動保存のタイミング）
  saveChanges()
}

const saveChanges = () => {
  const updatedStatus: Partial<InventoryStatus> = {
    id: props.inventoryStatus.id,
    replenishmentNote: localReplenishmentNote.value,
    replenishmentStatus: localIsCompleted.value ? REPLENISHMENT_STATUS.COMPLETED : REPLENISHMENT_STATUS.REQUIRED
  }

  emit('update', updatedStatus)
  hasChanges.value = false
}
</script>

<style scoped>
.replenish-item-card {
  height: 100%;
}

.replenish-item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
