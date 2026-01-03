import type { Meta, StoryObj } from '@storybook/vue3';
import InventoryItemCard from './InventoryItemCard.vue';

const meta = {
  title: 'Components/InventoryItemCard',
  component: InventoryItemCard,
  tags: ['autodocs'],
  argTypes: {
    inventoryStatus: {
      description: '在庫ステータスオブジェクト',
    },
  },
} satisfies Meta<typeof InventoryItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 未確認状態（補充不要）
export const Unconfirmed: Story = {
  args: {
    inventoryStatus: {
      id: '1',
      businessDate: '2025-09-27',
      item: {
        id: 'item-1',
        name: 'トマト',
        description: '新鮮なトマト',
        unit: '個',
        createdAt: '2025-09-27T00:00:00',
        updatedAt: '2025-09-27T00:00:00',
      },
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '補充不要',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      inventoryCount: 10,
      replenishmentCount: 0,
      replenishmentNote: '',
      createdAt: '2025-09-27T00:00:00',
      updatedAt: '2025-09-27T00:00:00',
    },
  },
};

// 未確認状態（要補充）
export const NeedsReplenishment: Story = {
  args: {
    inventoryStatus: {
      id: '2',
      businessDate: '2025-09-27',
      item: {
        id: 'item-2',
        name: 'じゃがいも',
        description: 'フライドポテト用',
        unit: '個',
        createdAt: '2025-09-27T00:00:00',
        updatedAt: '2025-09-27T00:00:00',
      },
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '要補充',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      inventoryCount: 2,
      replenishmentCount: 10,
      replenishmentNote: '冷蔵庫から補充',
      createdAt: '2025-09-27T00:00:00',
      updatedAt: '2025-09-27T00:00:00',
    },
  },
};

// 確認済み状態
export const Confirmed: Story = {
  args: {
    inventoryStatus: {
      id: '3',
      businessDate: '2025-09-27',
      item: {
        id: 'item-3',
        name: 'にんじん',
        description: '煮物用にんじん',
        unit: '本',
        createdAt: '2025-09-27T00:00:00',
        updatedAt: '2025-09-27T00:00:00',
      },
      inventoryCheckStatus: '確認済',
      replenishmentStatus: '補充不要',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      inventoryCount: 8,
      replenishmentCount: 0,
      replenishmentNote: '',
      createdAt: '2025-09-27T00:00:00',
      updatedAt: '2025-09-27T00:00:00',
    },
  },
};

// 確認不要状態
export const NotRequired: Story = {
  args: {
    inventoryStatus: {
      id: '4',
      businessDate: '2025-09-27',
      item: {
        id: 'item-4',
        name: 'レタス',
        description: 'サラダ用レタス',
        unit: '個',
        createdAt: '2025-09-27T00:00:00',
        updatedAt: '2025-09-27T00:00:00',
      },
      inventoryCheckStatus: '確認不要',
      replenishmentStatus: '補充不要',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      inventoryCount: 5,
      replenishmentCount: 0,
      replenishmentNote: '',
      createdAt: '2025-09-27T00:00:00',
      updatedAt: '2025-09-27T00:00:00',
    },
  },
};

// 大量補充が必要な状態
export const LargeReplenishment: Story = {
  args: {
    inventoryStatus: {
      id: '5',
      businessDate: '2025-09-27',
      item: {
        id: 'item-5',
        name: '卵',
        description: '新鮮な卵',
        unit: '個',
        createdAt: '2025-09-27T00:00:00',
        updatedAt: '2025-09-27T00:00:00',
      },
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '要補充',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      inventoryCount: 6,
      replenishmentCount: 24,
      replenishmentNote: 'ビレッジから大量補充が必要',
      createdAt: '2025-09-27T00:00:00',
      updatedAt: '2025-09-27T00:00:00',
    },
  },
};

