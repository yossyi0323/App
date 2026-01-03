<template>
   <CheckboxRoot
    :class="
      cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )
    "
    v-bind="$attrs"
    > <CheckboxIndicator class="flex items-center justify-center text-current"
      > <Check class="h-4 w-4" /> </CheckboxIndicator
    > </CheckboxRoot
  >
</template>

<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue';
import { Check } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  className?: string;
}

defineProps<CheckboxProps>();
</script>

