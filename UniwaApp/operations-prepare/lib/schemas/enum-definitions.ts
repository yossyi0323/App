import { z } from 'zod';

export const EnumValueSchema = z.object({
  code: z.string(), // 物理名（DBやAPIで使う値、例: '01', '99'）
  displayName: z.string(), // 表示名（画面表示用、例: '補充先'）
  logicalName: z.string(), // 論理名（ソースコードで使う値、例: 'DESTINATION'）
});

export const EnumCategorySchema = z.object({
  categoryCode: z.string(),
  categoryDisplayName: z.string(),
  categoryLogicalName: z.string(),
  values: z.array(EnumValueSchema),
});
