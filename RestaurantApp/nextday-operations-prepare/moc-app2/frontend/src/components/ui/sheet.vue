<template>
   <DialogRoot
    :open="open"
    @update:open="$emit('update:open', $event)"
    v-bind="$attrs"
    > <slot /> </DialogRoot
  >
</template>

<script setup lang="ts">
import { DialogRoot } from 'radix-vue';

interface SheetProps {
  open?: boolean;
}

const props = withDefaults(defineProps<SheetProps>(), {
  open: false,
});

defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();
</script>

