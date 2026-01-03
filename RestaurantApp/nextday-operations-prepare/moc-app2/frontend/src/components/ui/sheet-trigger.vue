<template>
   <DialogTrigger
    v-bind="$attrs"
    as-child
    > <slot /> </DialogTrigger
  >
</template>

<script setup lang="ts">
import { DialogTrigger } from 'radix-vue';
</script>

