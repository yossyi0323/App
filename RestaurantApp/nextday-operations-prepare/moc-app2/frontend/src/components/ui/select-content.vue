<template>
   <SelectPortal
    > <SelectContent
      :class="
        cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )
      "
      :position="position"
      v-bind="$attrs"
      > <SelectViewport
        :class="
          cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )
        "
        > <slot /> </SelectViewport
      > </SelectContent
    > </SelectPortal
  >
</template>

<script setup lang="ts">
import { SelectPortal, SelectContent, SelectViewport } from 'radix-vue';
import { cn } from '@/lib/utils';

interface SelectContentProps {
  position?: 'popper' | 'item-aligned';
  className?: string;
}

withDefaults(defineProps<SelectContentProps>(), {
  position: 'popper',
});
</script>

