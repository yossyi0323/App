<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-arrow-right-bold</v-icon>
            補充（移動）業務
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedSource"
                  :items="sourcePlaces"
                  item-title="name"
                  item-value="id"
                  label="補充元を選択"
                  prepend-icon="mdi-map-marker"
                  @update:model-value="onSourceChange"
                ></v-select>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">データを読み込み中...</div>
            </div>

            <div v-else-if="error" class="text-center">
              <v-alert type="error" variant="outlined">
                {{ error }}
              </v-alert>
            </div>

            <div v-else-if="replenishmentItems.length === 0" class="text-center">
              <v-alert type="info" variant="outlined">
                選択された補充元に対応する補充対象品物がありません。
              </v-alert>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="status in replenishmentItems"
                  :key="status.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <ReplenishItemCard
                    :inventory-status="status"
                    @update="onInventoryStatusUpdate"
                  />
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBusinessDateStore } from '@/stores/businessDate'
import { usePlaceStore } from '@/stores/place'
import { useInventoryStatusStore } from '@/stores/inventoryStatus'
import ReplenishItemCard from '@/components/ReplenishItemCard.vue'
import type { InventoryStatus } from '@/types'

const businessDateStore = useBusinessDateStore()
const placeStore = usePlaceStore()
const inventoryStatusStore = useInventoryStatusStore()

const selectedSource = ref<string>('')

const sourcePlaces = computed(() => placeStore.sourcePlaces)
const loading = computed(() => inventoryStatusStore.loading)
const error = computed(() => inventoryStatusStore.error)

// 補充対象の品物（要補充のもの）
const replenishmentItems = computed(() => {
  const allStatuses = inventoryStatusStore.inventoryStatuses
  console.log('All inventory statuses:', allStatuses)
  
  // 各アイテムのreplenishmentStatusを確認
  allStatuses.forEach((status, index) => {
    console.log(`Item ${index}: replenishmentStatus = "${status.replenishmentStatus}"`)
  })
  
  const filtered = allStatuses.filter(status => 
    status.replenishmentStatus === '要補充'
  )
  console.log('Filtered replenishment items:', filtered)
  return filtered
})

const onSourceChange = async () => {
  if (selectedSource.value) {
    await inventoryStatusStore.fetchInventoryStatusByDateAndSource(
      businessDateStore.businessDate,
      selectedSource.value
    )
  }
}

const onInventoryStatusUpdate = async (updatedStatus: Partial<InventoryStatus>) => {
  try {
    await inventoryStatusStore.updateInventoryStatus(updatedStatus)
  } catch (err) {
    console.error('Failed to update inventory status:', err)
  }
}

onMounted(async () => {
  await placeStore.fetchSourcePlaces()
})
</script>
