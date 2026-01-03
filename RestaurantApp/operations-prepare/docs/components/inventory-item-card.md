# InventoryItemCard

## Props

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| item | `Item` | Yes | - | - |
| date | `string` | Yes | - | - |
| currentStock | `number` | Yes | - | - |
| restockAmount | `number` | Yes | - | - |
| replenishmentStatus | `"99" | "01" | "02"` | Yes | - | - |
| memo | `string` | Yes | - | - |
| isChecked | `boolean` | Yes | - | - |
| onStockChange | `(value: number) => void` | Yes | - | - |
| onRestockChange | `(value: number) => void` | Yes | - | - |
| onNeedsRestockChange | `(value: boolean) => void` | Yes | - | - |
| onMemoChange | `(value: string) => void` | Yes | - | - |
| onCheckChange | `(value: boolean) => void` | Yes | - | - |
