<template>
  <v-card elevation="2" class="inventory-item-card">
    <v-card-title class="text-subtitle1">
      {{ inventoryStatus.item?.name || '品物名不明' }}
    </v-card-title>
    
    <v-card-text>
      <!-- バリデーションエラー表示 -->
      <v-alert
        v-if="validationErrors.length > 0"
        type="error"
        density="compact"
        class="mb-3"
      >
        <ul>
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </v-alert>

      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model.number="localInventoryCount"
            label="在庫数"
            type="number"
            variant="outlined"
            density="compact"
            :error-messages="getFieldError('inventoryCount')"
            @input="onInventoryCountChange"
            @blur="validateField('inventoryCount')"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="localReplenishmentCount"
            label="補充数"
            type="number"
            variant="outlined"
            density="compact"
            :error-messages="getFieldError('replenishmentCount')"
            @input="onReplenishmentCountChange"
            @blur="validateField('replenishmentCount')"
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
            :error-messages="getFieldError('replenishmentNote')"
            @input="onNoteChange"
            @blur="validateField('replenishmentNote')"
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
        :disabled="!isValid"
      >
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InventoryStatus } from '@/types'
import { InventoryStatusInputSchema } from '@/types'
import { REPLENISHMENT_STATUS, INVENTORY_CHECK_STATUS } from '@/types'
import type { z } from 'zod'

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

// バリデーション状態
const validationErrors = ref<string[]>([])
const fieldErrors = ref<Record<string, string[]>>({})
const hasChanges = ref<boolean>(false)

// バリデーション実行
const validate = (): boolean => {
  const data = {
    inventoryCount: localInventoryCount.value,
    replenishmentCount: localReplenishmentCount.value,
    replenishmentNote: localReplenishmentNote.value,
    isConfirmed: localIsConfirmed.value,
    isNotRequired: localIsNotRequired.value,
    isReplenishmentRequired: localIsReplenishmentRequired.value,
  }

  const result = InventoryStatusInputSchema.safeParse(data)
  
  if (!result.success) {
    // エラーメッセージを抽出
    validationErrors.value = result.error.errors.map(err => err.message)
    
    // フィールドごとのエラーを整理
    fieldErrors.value = {}
    result.error.errors.forEach(err => {
      const field = err.path[0] as string
      if (!fieldErrors.value[field]) {
        fieldErrors.value[field] = []
      }
      fieldErrors.value[field].push(err.message)
    })
    
    return false
  }
  
  validationErrors.value = []
  fieldErrors.value = {}
  return true
}

// 特定フィールドのバリデーション
const validateField = (fieldName: string) => {
  validate() // 全体バリデーションを実行（簡易版）
}

// フィールドのエラーメッセージ取得
const getFieldError = (fieldName: string): string[] => {
  return fieldErrors.value[fieldName] || []
}

// バリデーション状態
const isValid = computed(() => validationErrors.value.length === 0)

const onInventoryCountChange = () => {
  hasChanges.value = true
}

const onReplenishmentCountChange = () => {
  // 補充数が入力された場合は自動的に要補充にする
  if (localReplenishmentCount.value > 0) {
    localIsReplenishmentRequired.value = true
  }
  hasChanges.value = true
}

const onNoteChange = () => {
  hasChanges.value = true
}

const onConfirmedChange = (value: boolean) => {
  if (value) {
    localIsNotRequired.value = false
  }
  hasChanges.value = true
}

const onNotRequiredChange = (value: boolean) => {
  if (value) {
    localIsConfirmed.value = false
    localIsReplenishmentRequired.value = false
  }
  hasChanges.value = true
}

const onReplenishmentRequiredChange = (value: boolean) => {
  if (value && localReplenishmentCount.value === 0) {
    localReplenishmentCount.value = 1
  }
  hasChanges.value = true
}

const saveChanges = () => {
  // バリデーション実行
  if (!validate()) {
    return
  }

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

