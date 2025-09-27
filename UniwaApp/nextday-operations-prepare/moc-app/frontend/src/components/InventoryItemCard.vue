<template>
  <v-card elevation="2" class="inventory-item-card">
    <v-card-title class="text-subtitle1">
      {{ inventoryStatus.item?.name || '品物名不明' }}
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model.number="localInventoryCount"
            label="在庫数"
            type="number"
            variant="outlined"
            density="compact"
            @input="onInventoryCountChange"
            @blur="onBlur"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="localReplenishmentCount"
            label="補充数"
            type="number"
            variant="outlined"
            density="compact"
            @input="onReplenishmentCountChange"
            @blur="onBlur"
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
            @input="onNoteChange"
            @blur="onBlur"
          ></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-checkbox
            v-model="localIsConfirmed"
            label="確認済"
            color="success"
            @change="onConfirmedChange"
          ></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox
            v-model="localIsNotRequired"
            label="確認不要"
            color="info"
            @change="onNotRequiredChange"
          ></v-checkbox>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-checkbox
            v-model="localIsReplenishmentRequired"
            label="要補充"
            color="warning"
            @change="onReplenishmentRequiredChange"
          ></v-checkbox>
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
import { REPLENISHMENT_STATUS, INVENTORY_CHECK_STATUS } from '@/types'

interface Props {
  inventoryStatus: InventoryStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [status: Partial<InventoryStatus>]
}>()

// ローカル状態
const localInventoryCount = ref<number>(props.inventoryStatus.inventoryCount || 0)
const localReplenishmentCount = ref<number>(props.inventoryStatus.replenishmentCount || 0)
const localReplenishmentNote = ref<string>(props.inventoryStatus.replenishmentNote || '')
const localIsConfirmed = ref<boolean>(props.inventoryStatus.inventoryCheckStatus === '確認済')
const localIsNotRequired = ref<boolean>(props.inventoryStatus.inventoryCheckStatus === '確認不要')
const localIsReplenishmentRequired = ref<boolean>(props.inventoryStatus.replenishmentStatus === '要補充')

// 変更検知
const hasChanges = ref<boolean>(false)

// 変更検知のためのウォッチャー
watch([
  localInventoryCount,
  localReplenishmentCount,
  localReplenishmentNote,
  localIsConfirmed,
  localIsNotRequired,
  localIsReplenishmentRequired
], () => {
  hasChanges.value = true
}, { deep: true })

const onInventoryCountChange = () => {
  // 在庫数が変更されたときの処理
}

const onReplenishmentCountChange = () => {
  // 補充数が入力された場合は自動的に要補充にする
  if (localReplenishmentCount.value > 0) {
    localIsReplenishmentRequired.value = true
  }
}

const onNoteChange = () => {
  // メモ変更時の処理
}

const onConfirmedChange = (value: boolean) => {
  if (value) {
    localIsNotRequired.value = false
  }
}

const onNotRequiredChange = (value: boolean) => {
  if (value) {
    localIsConfirmed.value = false
    localIsReplenishmentRequired.value = false
  }
}

const onReplenishmentRequiredChange = (value: boolean) => {
  if (value && localReplenishmentCount.value === 0) {
    localReplenishmentCount.value = 1
  }
}

const onBlur = () => {
  // フォーカスが外れたときの処理（自動保存のタイミング）
  saveChanges()
}

const saveChanges = () => {
  const updatedStatus: Partial<InventoryStatus> = {
    id: props.inventoryStatus.id,
    inventoryCount: localInventoryCount.value,
    replenishmentCount: localReplenishmentCount.value,
    replenishmentNote: localReplenishmentNote.value,
    inventoryCheckStatus: getInventoryCheckStatus(),
    replenishmentStatus: getReplenishmentStatus()
  }

  emit('update', updatedStatus)
  hasChanges.value = false
}

const getInventoryCheckStatus = (): string => {
  if (localIsNotRequired.value) {
    return INVENTORY_CHECK_STATUS.NOT_REQUIRED
  }
  if (localIsConfirmed.value) {
    return INVENTORY_CHECK_STATUS.CONFIRMED
  }
  return INVENTORY_CHECK_STATUS.PENDING
}

const getReplenishmentStatus = (): string => {
  if (localIsNotRequired.value) {
    return REPLENISHMENT_STATUS.NOT_REQUIRED
  }
  if (localIsReplenishmentRequired.value) {
    return REPLENISHMENT_STATUS.REQUIRED
  }
  return REPLENISHMENT_STATUS.NOT_REQUIRED
}
</script>

<style scoped>
.inventory-item-card {
  height: 100%;
}

.inventory-item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
