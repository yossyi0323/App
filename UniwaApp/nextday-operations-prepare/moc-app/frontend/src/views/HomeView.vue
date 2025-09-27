<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-home</v-icon>
            トップページ
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="businessDate"
                  label="業務日付"
                  type="date"
                  prepend-icon="mdi-calendar"
                  @change="onBusinessDateChange"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 mb-4">業務メニュー</h3>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="business-card"
                  elevation="2"
                  @click="$router.push('/inventory')"
                >
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary">mdi-clipboard-check</v-icon>
                    <div class="text-h6 mt-2">在庫確認業務</div>
                    <div class="text-caption text-grey">補充先の在庫を確認し、補充数を入力</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="business-card"
                  elevation="2"
                  @click="$router.push('/replenishment')"
                >
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary">mdi-arrow-right-bold</v-icon>
                    <div class="text-h6 mt-2">補充（移動）業務</div>
                    <div class="text-caption text-grey">補充元から補充先へ移動</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="business-card"
                  elevation="2"
                  @click="$router.push('/creation')"
                >
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary">mdi-cog</v-icon>
                    <div class="text-h6 mt-2">補充（作成）業務</div>
                    <div class="text-caption text-grey">作成が必要な品物の管理</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="business-card"
                  elevation="2"
                  @click="$router.push('/order')"
                >
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary">mdi-shopping</v-icon>
                    <div class="text-h6 mt-2">発注依頼業務</div>
                    <div class="text-caption text-grey">発注が必要な品物の管理</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="business-card"
                  elevation="2"
                  @click="$router.push('/status')"
                >
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary">mdi-view-dashboard</v-icon>
                    <div class="text-h6 mt-2">営業準備状況一覧</div>
                    <div class="text-caption text-grey">全品物の準備状況を確認</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-h6 mb-4">予約情報入力</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="reservationForm.productName"
                  label="商品名"
                  prepend-icon="mdi-package-variant"
                  @input="onReservationChange"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="reservationForm.reservationCount"
                  label="予約数"
                  type="number"
                  prepend-icon="mdi-numeric"
                  @input="onReservationChange"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="reservationForm.memo"
                  label="メモ"
                  prepend-icon="mdi-note-text"
                  rows="3"
                  @input="onReservationChange"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBusinessDateStore } from '@/stores/businessDate'
import { format } from 'date-fns'

const businessDateStore = useBusinessDateStore()

const businessDate = ref(businessDateStore.businessDate)

const reservationForm = ref({
  productName: '',
  reservationCount: 0,
  memo: ''
})

const onBusinessDateChange = () => {
  businessDateStore.setBusinessDate(businessDate.value)
}

const onReservationChange = () => {
  // TODO: 予約情報の保存処理
  console.log('Reservation changed:', reservationForm.value)
}

onMounted(() => {
  businessDate.value = businessDateStore.businessDate
})
</script>

<style scoped>
.business-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.business-card:hover {
  transform: translateY(-2px);
}
</style>
