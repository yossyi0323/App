/**
 * Zodスキーマの内部構造をデバッグ
 */

import { InventoryStatusInputSchema } from '../src/types/index'
import * as util from 'util'

const shape = InventoryStatusInputSchema.shape

console.log('=== Zodスキーマの構造 ===\n')

for (const [fieldName, fieldSchema] of Object.entries(shape)) {
  console.log(`\n【${fieldName}】`)
  console.log(util.inspect(fieldSchema, { depth: 5, colors: true }))
}

