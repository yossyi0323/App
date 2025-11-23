<template>
  <div class="w-full space-y-4">
    <Card v-for="item in items" :key="item.id" class="relative w-full">
      <CardHeader class="pb-2">
        <CardTitle class="text-lg">{{ item.name }}</CardTitle>
        <CardDescription v-if="item.description">{{ item.description }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">在庫確認</span>
            <Badge :variant="getInventoryStatusVariant(item)" class="text-sm">
              {{ getInventoryStatusLabel(item) }}
            </Badge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">補充</span>
            <Badge :variant="getReplenishmentStatusVariant(item)" class="text-sm">
              {{ getReplenishmentStatusLabel(item) }}
            </Badge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">作成</span>
            <Badge :variant="getPreparationStatusVariant(item)" class="text-sm">
              {{ getPreparationStatusLabel(item) }}
            </Badge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">発注依頼</span>
            <Badge :variant="getOrderRequestStatusVariant(item)" class="text-sm">
              {{ getOrderRequestStatusLabel(item) }}
            </Badge>
          </div>

          <div
            v-if="getInventoryStatus(item)"
            class="mt-2 pt-2 border-t border-border/50 space-y-1"
          >
            <div class="text-xs text-muted-foreground">
              在庫数: {{ getInventoryStatus(item)?.inventoryCount ?? 0 }}
            </div>

            <div class="text-xs text-muted-foreground">
              補充数: {{ getInventoryStatus(item)?.replenishmentCount ?? 0 }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/ui/card.vue";
import CardHeader from "@/components/ui/card-header.vue";
import CardTitle from "@/components/ui/card-title.vue";
import CardDescription from "@/components/ui/card-description.vue";
import CardContent from "@/components/ui/card-content.vue";
import Badge from "@/components/ui/badge.vue";
import type { Item, InventoryStatus } from "@/types";
import { INVENTORY_STATUS } from "@/lib/enums/inventory-status";
import { REPLENISHMENT_STATUS } from "@/lib/enums/replenishment-status";
import { PREPARATION_STATUS } from "@/lib/enums/preparation-status";
import { ORDER_REQUEST_STATUS } from "@/lib/enums/order-request-status";
import { getCode, isEnumCode, getDisplayName, toEnumCode } from "@/lib/utils/enum-utils";

interface StatusOverviewProps {
  date: string;
  items: Item[];
  inventoryStatuses: InventoryStatus[];
}

const props = defineProps<StatusOverviewProps>();

const getInventoryStatus = (item: Item): InventoryStatus | undefined => {
  return props.inventoryStatuses.find(
    (status) => status.itemId === item.id || status.item?.id === item.id
  );
};

const getInventoryStatusVariant = (
  item: Item
): "default" | "secondary" | "destructive" | "outline" => {
  const status = getInventoryStatus(item);
  if (!status) return "outline";
  const checkStatus = toEnumCode(
    INVENTORY_STATUS,
    status.inventoryCheckStatus ?? getCode(INVENTORY_STATUS, "UNCONFIRMED")
  );
  return isEnumCode(INVENTORY_STATUS, checkStatus, "CONFIRMED") ? "default" : "secondary";
};

const getInventoryStatusLabel = (item: Item): string => {
  const status = getInventoryStatus(item);
  if (!status) return "未確認";
  const checkStatus = toEnumCode(
    INVENTORY_STATUS,
    status.inventoryCheckStatus ?? getCode(INVENTORY_STATUS, "UNCONFIRMED")
  );
  return getDisplayName(INVENTORY_STATUS, checkStatus);
};

const getReplenishmentStatusVariant = (
  item: Item
): "default" | "secondary" | "destructive" | "outline" => {
  const status = getInventoryStatus(item);
  if (!status) return "outline";
  const replenishmentStatus = toEnumCode(
    REPLENISHMENT_STATUS,
    status.replenishmentStatus ?? getCode(REPLENISHMENT_STATUS, "NOT_REQUIRED")
  );
  if (isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, "REQUIRED"))
    return "destructive";
  if (isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, "COMPLETED"))
    return "default";
  return "secondary";
};

const getReplenishmentStatusLabel = (item: Item): string => {
  const status = getInventoryStatus(item);
  if (!status) return "補充不要";
  const replenishmentStatus = toEnumCode(
    REPLENISHMENT_STATUS,
    status.replenishmentStatus ?? getCode(REPLENISHMENT_STATUS, "NOT_REQUIRED")
  );
  return getDisplayName(REPLENISHMENT_STATUS, replenishmentStatus);
};

const getPreparationStatusVariant = (
  item: Item
): "default" | "secondary" | "destructive" | "outline" => {
  const status = getInventoryStatus(item);
  if (!status) return "outline";
  const preparationStatus = toEnumCode(
    PREPARATION_STATUS,
    status.preparationStatus ?? getCode(PREPARATION_STATUS, "NOT_REQUIRED")
  );
  if (isEnumCode(PREPARATION_STATUS, preparationStatus, "REQUIRED")) return "destructive";
  if (isEnumCode(PREPARATION_STATUS, preparationStatus, "COMPLETED")) return "default";
  return "secondary";
};

const getPreparationStatusLabel = (item: Item): string => {
  const status = getInventoryStatus(item);
  if (!status) return "作成不要";
  const preparationStatus = toEnumCode(
    PREPARATION_STATUS,
    status.preparationStatus ?? getCode(PREPARATION_STATUS, "NOT_REQUIRED")
  );
  return getDisplayName(PREPARATION_STATUS, preparationStatus);
};

const getOrderRequestStatusVariant = (
  item: Item
): "default" | "secondary" | "destructive" | "outline" => {
  const status = getInventoryStatus(item);
  if (!status) return "outline";
  const orderRequestStatus = toEnumCode(
    ORDER_REQUEST_STATUS,
    status.orderRequestStatus ?? getCode(ORDER_REQUEST_STATUS, "NOT_REQUIRED")
  );
  if (isEnumCode(ORDER_REQUEST_STATUS, orderRequestStatus, "REQUIRED"))
    return "destructive";
  if (isEnumCode(ORDER_REQUEST_STATUS, orderRequestStatus, "REQUESTED")) return "default";
  return "secondary";
};

const getOrderRequestStatusLabel = (item: Item): string => {
  const status = getInventoryStatus(item);
  if (!status) return "発注不要";
  const orderRequestStatus = toEnumCode(
    ORDER_REQUEST_STATUS,
    status.orderRequestStatus ?? getCode(ORDER_REQUEST_STATUS, "NOT_REQUIRED")
  );
  return getDisplayName(ORDER_REQUEST_STATUS, orderRequestStatus);
};
</script>
