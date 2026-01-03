<template>
   <ScrollAreaRoot
    :class="cn('relative overflow-hidden', className)"
    v-bind="$attrs"
    > <ScrollAreaViewport class="h-full w-full rounded-[inherit]"> <slot /> </ScrollAreaViewport>
    <ScrollBar /> <ScrollAreaCorner /> </ScrollAreaRoot
  >
</template>

<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaCorner } from 'radix-vue';
import ScrollBar from './scroll-bar.vue';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  className?: string;
}

defineProps<ScrollAreaProps>();
</script>

