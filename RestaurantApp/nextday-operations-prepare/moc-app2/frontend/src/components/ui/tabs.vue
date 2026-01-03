<template>
   <TabsRoot
    :model-value="modelValue"
    @update:model-value="handleValueChange"
    v-bind="$attrs"
    > <slot /> </TabsRoot
  >
</template>

<script setup lang="ts">
import { TabsRoot } from 'radix-vue';

interface TabsProps {
  modelValue?: string;
  defaultValue?: string;
}

const props = withDefaults(defineProps<TabsProps>(), {
  defaultValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleValueChange = (value: string) => {
  emit('update:modelValue', value);
};
</script>

