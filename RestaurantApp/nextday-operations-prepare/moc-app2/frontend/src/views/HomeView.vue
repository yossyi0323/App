<template>

  <div>

    <h1 class="text-3xl font-bold mb-4">営業準備業務</h1>
     <DateSelector
      :date="selectedDate"
      @onDateChange="handleDateChange"
    />
    <div class="grid gap-4 mt-4">
       <Card
        > <CardHeader class="pb-2"
          > <CardTitle class="text-xl">業務メニュー</CardTitle>
          <CardDescription>準備業務を開始する</CardDescription> </CardHeader
        > <CardContent
          >
          <div class="grid gap-3">
             <RouterLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="block"
              > <Button
                variant="outline"
                class="h-auto py-3 w-full justify-start text-left"
                >
                <div class="flex items-center gap-3 w-full">
                   <component
                    :is="item.icon"
                    class="h-6 w-6 flex-shrink-0"
                  />
                  <div class="flex-1">

                    <div class="font-medium">{{ item.title }}</div>

                    <div class="text-xs text-muted-foreground mt-1">{{ item.description }}</div>

                  </div>

                </div>
                 </Button
              > </RouterLink
            >
          </div>
           </CardContent
        > </Card
      >
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { format, parse } from 'date-fns';
import DateSelector from '@/components/DateSelector.vue';
import Card from '@/components/ui/card.vue';
import CardHeader from '@/components/ui/card-header.vue';
import CardTitle from '@/components/ui/card-title.vue';
import CardDescription from '@/components/ui/card-description.vue';
import CardContent from '@/components/ui/card-content.vue';
import Button from '@/components/ui/button.vue';
import {
  Calendar as CalendarIcon,
  Box,
  Truck,
  PlusCircle,
  ShoppingCart,
  Clipboard,
} from 'lucide-vue-next';
import { useBusinessDateStore } from '@/stores/businessDate';

const businessDateStore = useBusinessDateStore();

const selectedDate = ref(parse(businessDateStore.businessDate, 'yyyy-MM-dd', new Date()));

const menuItems = [
  {
    title: '在庫確認業務',
    description: '補充先の在庫を確認し、補充が必要な品物を特定します',
    path: '/inventory',
    icon: Box,
  },
  {
    title: '補充（移動）業務',
    description: '補充元から補充先へ品物を移動させます',
    path: '/replenishment',
    icon: Truck,
  },
  {
    title: '補充（作成）業務',
    description: '補充元の在庫が足りない品物を作成します',
    path: '/creation',
    icon: PlusCircle,
  },
  {
    title: '発注依頼業務',
    description: '発注が必要な品物について発注依頼を行います',
    path: '/order',
    icon: ShoppingCart,
  },
  {
    title: '営業準備状況一覧',
    description: '営業準備の進捗状況を確認します',
    path: '/status',
    icon: Clipboard,
  },
];

const handleDateChange = (date: Date) => {
  selectedDate.value = date;
  businessDateStore.setBusinessDate(format(date, 'yyyy-MM-dd'));
};
</script>

