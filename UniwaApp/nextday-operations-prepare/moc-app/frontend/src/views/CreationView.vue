<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-cog</v-icon>
            補充（作成）業務
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">データを読み込み中...</div>
            </div>

            <div v-else-if="error" class="text-center">
              <v-alert type="error" variant="outlined">
                {{ error }}
              </v-alert>
            </div>

            <div v-else-if="creationItems.length === 0" class="text-center">
              <v-alert type="info" variant="outlined">
                作成対象の品物がありません。
              </v-alert>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="status in creationItems"
                  :key="status.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <CreationItemCard
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
import { computed, onMounted } from 'vue'
import { useBusinessDateStore } from '@/stores/businessDate'
import { useInventoryStatusStore } from '@/stores/inventoryStatus'
import CreationItemCard from '@/components/CreationItemCard.vue'
import type { InventoryStatus } from '@/types'

const businessDateStore = useBusinessDateStore()
const inventoryStatusStore = useInventoryStatusStore()

const loading = computed(() => inventoryStatusStore.loading)
const error = computed(() => inventoryStatusStore.error)

// 作成対象の品物（要補充かつ作成タイプ）
const creationItems = computed(() => 
  inventoryStatusStore.inventoryStatuses.filter(status => 
    status.replenishmentStatus === '要補充' && 
    status.preparationStatus === '要作成' &&
    status.replenishmentType === '作成'
  )
)

const onInventoryStatusUpdate = async (updatedStatus: Partial<InventoryStatus>) => {
  try {
    await inventoryStatusStore.updateInventoryStatus(updatedStatus)
  } catch (err) {
    console.error('Failed to update inventory status:', err)
  }
}

onMounted(async () => {
  await inventoryStatusStore.fetchInventoryStatusByDate(businessDateStore.businessDate)
})
</script>
