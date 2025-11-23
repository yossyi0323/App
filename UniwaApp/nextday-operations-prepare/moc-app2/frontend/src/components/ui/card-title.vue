<template>

  <h3
    :class="cn('text-2xl font-semibold leading-none tracking-tight', className)"
    v-bind="$attrs"
  >
     <slot />
  </h3>

</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface CardTitleProps {
  className?: string;
}

defineProps<CardTitleProps>();
</script>

