/**
 * Zodスキーマから入力仕様書を自動生成するスクリプト
 * 
 * 使い方:
 *   npx tsx scripts/generate-input-spec-docs.ts
 */

import { InventoryStatusInputSchema } from '../src/types/index'
import type { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type ZodSchema = z.ZodObject<any>

/**
 * Zodスキーマから仕様書Markdownを生成
 */
function generateMarkdownFromSchema(schema: ZodSchema, title: string): string {
  const lines: string[] = []
  
  lines.push(`# ${title}`)
  lines.push('')
  lines.push('このドキュメントは `src/types/index.ts` の Zodスキーマから自動生成されています。')
  lines.push('')
  lines.push('## 入力項目')
  lines.push('')
  
  const shape = schema.shape
  
  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const fieldInfo = extractFieldInfo(fieldSchema as any, fieldName)
    
    lines.push(`### ${fieldInfo.label || fieldName}`)
    lines.push('')
    lines.push(`- **フィールド名**: \`${fieldName}\``)
    lines.push(`- **型**: ${fieldInfo.type}`)
    
    if (fieldInfo.required !== undefined) {
      lines.push(`- **必須**: ${fieldInfo.required ? 'はい' : 'いいえ'}`)
    }
    
    if (fieldInfo.defaultValue !== undefined) {
      lines.push(`- **初期値**: \`${fieldInfo.defaultValue}\``)
    }
    
    if (fieldInfo.constraints.length > 0) {
      lines.push(`- **制約**:`)
      fieldInfo.constraints.forEach(constraint => {
        lines.push(`  - ${constraint}`)
      })
    }
    
    if (fieldInfo.description) {
      lines.push(`- **説明**: ${fieldInfo.description}`)
    }
    
    lines.push('')
  }
  
  lines.push('---')
  lines.push('')
  lines.push(`最終更新: ${new Date().toISOString()}`)
  
  return lines.join('\n')
}

/**
 * Zodフィールドスキーマから情報を抽出（再帰的に処理）
 */
function extractFieldInfo(fieldSchema: any, fieldName: string): any {
  const info: {
    label?: string
    type: string
    required: boolean
    defaultValue?: any
    constraints: string[]
    description?: string
  } = {
    type: 'unknown',
    required: true,
    constraints: []
  }
  
  let currentSchema = fieldSchema
  
  // ZodDefaultをアンラップ
  if (currentSchema.def?.type === 'default') {
    info.defaultValue = currentSchema.def.defaultValue
    currentSchema = currentSchema.def.innerType
  }
  
  // ZodOptionalをアンラップ
  if (currentSchema.def?.type === 'optional') {
    info.required = false
    currentSchema = currentSchema.def.innerType
  }
  
  // 型判定
  const schemaType = currentSchema.def?.type || currentSchema.type
  if (schemaType === 'number') {
    info.type = '数値'
    
    // 数値の制約を取得
    if (currentSchema.minValue !== undefined) {
      info.constraints.push(`最小値: ${currentSchema.minValue}`)
    }
    if (currentSchema.maxValue !== undefined && currentSchema.maxValue < 9007199254740991) {
      info.constraints.push(`最大値: ${currentSchema.maxValue}`)
    }
    if (currentSchema.isInt) {
      info.constraints.push('整数のみ')
    }
    
  } else if (schemaType === 'string') {
    info.type = '文字列'
    
    // 文字列の制約を取得
    if (currentSchema.minLength !== null && currentSchema.minLength !== undefined) {
      info.constraints.push(`最小長: ${currentSchema.minLength}`)
    }
    if (currentSchema.maxLength !== null && currentSchema.maxLength !== undefined) {
      info.constraints.push(`最大長: ${currentSchema.maxLength}`)
    }
    
  } else if (schemaType === 'boolean') {
    info.type = '真偽値'
  }
  
  // 日本語ラベル推定
  const labels: Record<string, string> = {
    inventoryCount: '在庫数',
    replenishmentCount: '補充数',
    replenishmentNote: '補充メモ',
    isConfirmed: '確認済',
    isNotRequired: '確認不要',
    isReplenishmentRequired: '要補充',
  }
  info.label = labels[fieldName]
  
  return info
}

// メイン処理
function main() {
  const markdown = generateMarkdownFromSchema(
    InventoryStatusInputSchema,
    '在庫ステータス入力仕様'
  )
  
  // docsディレクトリを作成
  const docsDir = path.join(__dirname, '..', 'docs')
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }
  
  // ファイルに書き込み（UTF-8）
  const outputPath = path.join(docsDir, 'INPUT_SPEC.md')
  fs.writeFileSync(outputPath, markdown, 'utf-8')
  
  console.log(`✓ ドキュメントを生成しました: ${outputPath}`)
  console.log('\n')
  console.log(markdown)
}

main()

