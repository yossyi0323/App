<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-view-dashboard</v-icon>
            営業準備状況一覧
          </v-card-title>
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="showPendingOnly"
                  label="要対応品目のみ表示"
                  color="warning"
                  @change="onFilterChange"
                ></v-checkbox>
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

            <div v-else-if="filteredItems.length === 0" class="text-center">
              <v-alert type="info" variant="outlined">
                表示する品物がありません。
              </v-alert>
            </div>

            <div v-else>
              <v-data-table
                :headers="headers"
                :items="filteredItems"
                :items-per-page="25"
                class="elevation-1"
              >
                <template v-slot:item.inventoryCheckStatus="{ item }">
                  <v-chip
                    :color="getStatusColor(item.inventoryCheckStatus)"
                    variant="outlined"
                    size="small"
                  >
                    {{ item.inventoryCheckStatus }}
                  </v-chip>
                </template>

                <template v-slot:item.replenishmentStatus="{ item }">
                  <v-chip
                    :color="getStatusColor(item.replenishmentStatus)"
                    variant="outlined"
                    size="small"
                  >
                    {{ item.replenishmentStatus }}
                  </v-chip>
                </template>

                <template v-slot:item.preparationStatus="{ item }">
                  <v-chip
                    :color="getStatusColor(item.preparationStatus)"
                    variant="outlined"
                    size="small"
                  >
                    {{ item.preparationStatus }}
                  </v-chip>
                </template>

                <template v-slot:item.orderRequestStatus="{ item }">
                  <v-chip
                    :color="getStatusColor(item.orderRequestStatus)"
                    variant="outlined"
                    size="small"
                  >
                    {{ item.orderRequestStatus }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    color="primary"
                    variant="text"
                    @click="editItem(item)"
                  ></v-btn>
                </template>
              </v-data-table>
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
import { useInventoryStatusStore } from '@/stores/inventoryStatus'
import type { InventoryStatus } from '@/types'

const businessDateStore = useBusinessDateStore()
const inventoryStatusStore = useInventoryStatusStore()

const showPendingOnly = ref<boolean>(true)

const loading = computed(() => inventoryStatusStore.loading)
const error = computed(() => inventoryStatusStore.error)

const headers = [
  { title: '品物名', key: 'item.name', sortable: true },
  { title: '在庫数', key: 'inventoryCount', sortable: true },
  { title: '補充数', key: 'replenishmentCount', sortable: true },
  { title: '在庫確認', key: 'inventoryCheckStatus', sortable: true },
  { title: '補充', key: 'replenishmentStatus', sortable: true },
  { title: '作成', key: 'preparationStatus', sortable: true },
  { title: '発注', key: 'orderRequestStatus', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

const filteredItems = computed(() => {
  const items = inventoryStatusStore.inventoryStatuses
  
  if (showPendingOnly.value) {
    return items.filter(item => 
      item.inventoryCheckStatus === '未確認' ||
      item.replenishmentStatus === '要補充' ||
      item.preparationStatus === '要作成' ||
      item.orderRequestStatus === '要発注依頼'
    )
  }
  
  return items
})

const getStatusColor = (status: string): string => {
  switch (status) {
    case '未確認':
    case '要補充':
    case '要作成':
    case '要発注依頼':
      return 'warning'
    case '確認済':
    case '補充済':
    case '作成済':
    case '発注依頼済':
      return 'success'
    case '確認不要':
    case '補充不要':
    case '作成不要':
    case '発注不要':
      return 'info'
    default:
      return 'grey'
  }
}

const onFilterChange = () => {
  // フィルター変更時の処理
}

const editItem = (item: InventoryStatus) => {
  // 編集画面への遷移処理
  console.log('Edit item:', item)
}

onMounted(async () => {
  await inventoryStatusStore.fetchInventoryStatusByDate(businessDateStore.businessDate)
})
</script>
