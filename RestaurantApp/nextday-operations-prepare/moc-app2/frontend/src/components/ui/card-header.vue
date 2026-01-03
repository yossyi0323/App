<template>

  <div
    :class="cn('flex flex-col space-y-1.5 p-6', className)"
    v-bind="$attrs"
  >
     <slot />
  </div>

</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface CardHeaderProps {
  className?: string;
}

defineProps<CardHeaderProps>();
</script>

