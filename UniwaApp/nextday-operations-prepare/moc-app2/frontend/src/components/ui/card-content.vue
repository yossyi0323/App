<template>

  <div
    :class="cn('p-6 pt-0', className)"
    v-bind="$attrs"
  >
     <slot />
  </div>

</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface CardContentProps {
  className?: string;
}

defineProps<CardContentProps>();
</script>

