<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-shopping</v-icon>
            発注依頼業務
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

            <div v-else-if="orderItems.length === 0" class="text-center">
              <v-alert type="info" variant="outlined">
                発注依頼対象の品物がありません。
              </v-alert>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="status in orderItems"
                  :key="status.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <OrderItemCard
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
import OrderItemCard from '@/components/OrderItemCard.vue'
import type { InventoryStatus } from '@/types'

const businessDateStore = useBusinessDateStore()
const inventoryStatusStore = useInventoryStatusStore()

const loading = computed(() => inventoryStatusStore.loading)
const error = computed(() => inventoryStatusStore.error)

// 発注依頼対象の品物
const orderItems = computed(() => 
  inventoryStatusStore.inventoryStatuses.filter(status => 
    status.orderRequestStatus === '要発注依頼'
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
