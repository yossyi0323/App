<template>

  <div class="flex flex-col min-h-screen">
     <!-- Header -->
    <header class="sticky top-0 z-50 bg-background border-b border-border">

      <div class="container flex items-center justify-between h-14 px-4">

        <div class="flex items-center gap-3">
           <Sheet
            :open="isOpen"
            @update:open="setIsOpen"
            > <SheetTrigger as-child
              > <Button
                variant="ghost"
                size="icon"
                class="md:hidden"
                > <Menu class="h-5 w-5" /> <span class="sr-only">メニュー</span> </Button
              > </SheetTrigger
            > <SheetContent
              side="left"
              class="p-0"
              :style="{ paddingLeft: 'env(safe-area-inset-left)' }"
              >
              <div class="flex flex-col h-full">

                <div
                  class="p-4 border-b flex justify-between items-center"
                  :style="{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }"
                >

                  <h2 class="text-lg font-medium">メニュー</h2>
                   <Button
                    variant="ghost"
                    size="icon"
                    @click="setIsOpen(false)"
                    > <X class="h-5 w-5" /> </Button
                  >
                </div>
                 <ScrollArea class="flex-1"
                  >
                  <nav class="px-2 py-4">

                    <ul class="space-y-2">

                      <li
                        v-for="item in menuItems"
                        :key="item.path"
                      >
                         <RouterLink
                          :to="item.path"
                          @click="setIsOpen(false)"
                          :class="[
                            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                            $route.path === item.path
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-secondary',
                          ]"
                          > <component
                            :is="item.iconComponent"
                            class="h-5 w-5"
                          /> {{ item.name }} </RouterLink
                        >
                      </li>

                    </ul>

                  </nav>
                   </ScrollArea
                >
              </div>
               </SheetContent
            > </Sheet
          >
          <h1 class="text-lg font-semibold">営業準備アプリ</h1>

        </div>

        <div class="flex items-center gap-2">
           <Button
            variant="ghost"
            size="icon"
            @click="toggleTheme"
            > <Sun
              v-if="isDark"
              class="h-5 w-5"
            /> <Moon
              v-else
              class="h-5 w-5"
            /> <span class="sr-only">テーマ切替</span> </Button
          >
        </div>

      </div>

    </header>
     <!-- Main content -->
    <main class="flex-1 container px-4 py-4 max-w-lg mx-auto"> <slot /> </main>
     <!-- Mobile navigation -->
    <div
      class="md:hidden sticky bottom-0 z-40 bg-background border-t border-border bottom-nav-safe"
    >

      <nav class="flex items-center justify-around h-16">
         <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex flex-col items-center justify-center w-full h-full text-xs',
            $route.path === item.path ? 'text-primary' : 'text-muted-foreground',
          ]"
          > <component
            :is="item.iconComponent"
            class="h-5 w-5"
          /> <span class="mt-1">{{ item.name }}</span
          > </RouterLink
        >
      </nav>

    </div>

  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Box,
  Truck,
  PlusCircle,
  ShoppingCart,
  Clipboard,
} from 'lucide-vue-next';
import Sheet from '@/components/ui/sheet.vue';
import SheetTrigger from '@/components/ui/sheet-trigger.vue';
import SheetContent from '@/components/ui/sheet-content.vue';
import Button from '@/components/ui/button.vue';
import ScrollArea from '@/components/ui/scroll-area.vue';
import { LABELS } from '@/lib/constants/labels';

const route = useRoute();
const isOpen = ref(false);
const setIsOpen = (value: boolean) => {
  isOpen.value = value;
};

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

const menuItems = [
  { name: LABELS.MENU_HOME || 'ホーム', iconComponent: Home, path: '/' },
  { name: LABELS.INVENTORY_CHECK || '在庫確認', iconComponent: Box, path: '/inventory' },
  { name: LABELS.REPLENISHMENT || '補充（移動）', iconComponent: Truck, path: '/replenishment' },
  { name: LABELS.CREATION || '補充（作成）', iconComponent: PlusCircle, path: '/creation' },
  { name: LABELS.ORDER_REQUEST || '発注依頼', iconComponent: ShoppingCart, path: '/order' },
  { name: LABELS.STATUS_LIST || '営業準備状況', iconComponent: Clipboard, path: '/status' },
];
</script>

