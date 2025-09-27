<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-clipboard-check</v-icon>
            在庫確認業務
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedDestination"
                  :items="destinationPlaces"
                  item-title="name"
                  item-value="id"
                  label="補充先を選択"
                  prepend-icon="mdi-map-marker"
                  @update:model-value="onDestinationChange"
                ></v-select>
              </v-col>
            </v-row>

            <v-row v-if="selectedDestination">
              <v-col cols="12" md="4">
                <v-chip color="warning" variant="outlined">
                  <v-icon start>mdi-help-circle</v-icon>
                  未確認: {{ unconfirmedCount }}
                </v-chip>
              </v-col>
              <v-col cols="12" md="4">
                <v-chip color="success" variant="outlined">
                  <v-icon start>mdi-check-circle</v-icon>
                  確認済: {{ confirmedCount }}
                </v-chip>
              </v-col>
              <v-col cols="12" md="4">
                <v-chip color="info" variant="outlined">
                  <v-icon start>mdi-minus-circle</v-icon>
                  確認不要: {{ notRequiredCount }}
                </v-chip>
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

            <div v-else-if="inventoryStatuses.length === 0" class="text-center">
              <v-alert type="info" variant="outlined">
                選択された補充先に対応する品物がありません。
              </v-alert>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="status in inventoryStatuses"
                  :key="status.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <InventoryItemCard
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
import { ref, computed, onMounted, watch } from 'vue'
import { useBusinessDateStore } from '@/stores/businessDate'
import { usePlaceStore } from '@/stores/place'
import { useInventoryStatusStore } from '@/stores/inventoryStatus'
import InventoryItemCard from '@/components/InventoryItemCard.vue'
import type { InventoryStatus } from '@/types'

const businessDateStore = useBusinessDateStore()
const placeStore = usePlaceStore()
const inventoryStatusStore = useInventoryStatusStore()

const selectedDestination = ref<string>('')

const destinationPlaces = computed(() => placeStore.destinationPlaces)
const inventoryStatuses = computed(() => inventoryStatusStore.inventoryStatuses)
const loading = computed(() => inventoryStatusStore.loading)
const error = computed(() => inventoryStatusStore.error)

const unconfirmedCount = computed(() => 
  inventoryStatuses.value.filter(s => s.inventoryCheckStatus === '未確認').length
)

const confirmedCount = computed(() => 
  inventoryStatuses.value.filter(s => s.inventoryCheckStatus === '確認済').length
)

const notRequiredCount = computed(() => 
  inventoryStatuses.value.filter(s => s.inventoryCheckStatus === '確認不要').length
)

const onDestinationChange = async () => {
  if (selectedDestination.value) {
    await inventoryStatusStore.fetchInventoryStatusByDateAndDestination(
      businessDateStore.businessDate,
      selectedDestination.value
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
  await placeStore.fetchDestinationPlaces()
})
</script>
