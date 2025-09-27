<template>
  <v-card elevation="2" class="order-item-card">
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
          <v-text-field
            :model-value="inventoryStatus.orderRequestDestination || '未設定'"
            label="発注依頼先"
            variant="outlined"
            density="compact"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-radio-group
            v-model="localOrderRequestStatus"
            inline
            @update:model-value="onStatusChange"
          >
            <v-radio
              label="要発注依頼"
              value="要発注依頼"
              color="warning"
            ></v-radio>
            <v-radio
              label="発注依頼済"
              value="発注依頼済"
              color="success"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="localReplenishmentNote"
            label="発注メモ"
            variant="outlined"
            density="compact"
            rows="2"
            placeholder="発注に関するメモを入力してください"
            @input="onNoteChange"
            @blur="onBlur"
          ></v-textarea>
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

interface Props {
  inventoryStatus: InventoryStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [status: Partial<InventoryStatus>]
}>()

// ローカル状態
const localOrderRequestStatus = ref<string>(props.inventoryStatus.orderRequestStatus)
const localReplenishmentNote = ref<string>(props.inventoryStatus.replenishmentNote || '')

// 変更検知
const hasChanges = ref<boolean>(false)

// 変更検知のためのウォッチャー
watch([
  localOrderRequestStatus,
  localReplenishmentNote
], () => {
  hasChanges.value = true
}, { deep: true })

const onStatusChange = () => {
  // ステータス変更時の処理
}

const onNoteChange = () => {
  // メモ変更時の処理
}

const onBlur = () => {
  // フォーカスが外れたときの処理（自動保存のタイミング）
  saveChanges()
}

const saveChanges = () => {
  const updatedStatus: Partial<InventoryStatus> = {
    id: props.inventoryStatus.id,
    orderRequestStatus: localOrderRequestStatus.value,
    replenishmentNote: localReplenishmentNote.value
  }

  emit('update', updatedStatus)
  hasChanges.value = false
}
</script>

<style scoped>
.order-item-card {
  height: 100%;
}

.order-item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
