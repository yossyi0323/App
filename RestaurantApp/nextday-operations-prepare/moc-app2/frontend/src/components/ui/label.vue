<template>
   <label
    :for="htmlFor"
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )
    "
    v-bind="$attrs"
    > <slot /> </label
  >
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

interface LabelProps {
  htmlFor?: string;
  className?: string;
}

defineProps<LabelProps>();
</script>

