'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LABELS } from '@/lib/constants/labels';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import type { Item } from '@/lib/types';
import { getCode, isEnumCode } from '@/lib/utils/enum-utils';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import type { EnumCode } from '@/lib/utils/enum-utils';
import TextareaAutosize from 'react-textarea-autosize';
import { NUMBER_PLACEHOLDER } from '@/lib/constants/constants';

interface InventoryItemCardProps {
  item: Item;
  date: string;
  currentStock: number;
  restockAmount: number;
  replenishmentStatus: EnumCode<typeof REPLENISHMENT_STATUS>;
  memo: string;
  isChecked: boolean;
  onStockChange: (value: number) => void;
  onRestockChange: (value: number) => void;
  onNeedsRestockChange: (value: boolean) => void;
  onMemoChange: (value: string) => void;
  onCheckChange: (value: boolean) => void;
}

export function InventoryItemCard({
  item,
  date,
  currentStock,
  restockAmount,
  replenishmentStatus,
  memo,
  isChecked,
  onStockChange,
  onRestockChange,
  onNeedsRestockChange,
  onMemoChange,
  onCheckChange,
}: InventoryItemCardProps) {
  // 初期値判定をコンポーネント内で実施
  const [isMemoOpen, setIsMemoOpen] = useState(
    currentStock !== 0 || restockAmount !== 0 || memo !== ''
  );
  const textGray = '';

  // 区分値→UI用boolean変換
  const isRestocked = isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'COMPLETED');
  const isNeedsRestock = !isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'NOT_REQUIRED');

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onStockChange(value);
  };

  const handleRestockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onRestockChange(value);
  };

  const handleNeedsRestockChange = (checked: boolean) => {
    onNeedsRestockChange(checked);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onMemoChange(value);
  };

  return (
    <Card className="mb-3 overflow-hidden relative bg-background">
      <CardContent className="pt-2 pb-2 pl-4 pr-4 relative z-20">
        {/* 1行目：チェックボックス・品名・ラジオ・トグル */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {/* 未確認・確認済チェックボックス */}
          <Checkbox
            checked={isChecked}
            onCheckedChange={onCheckChange}
            className="h-5 w-5"
            disabled={isRestocked}
          />
          {/* 品物名 */}
          <span className="flex-1 text-sm font-medium break-words min-w-[120px]">
            {item.item_name}
          </span>
          {/* 要補充トグルスイッチ */}
          <div className="flex flex-col items-center gap-1">
            <Switch
              checked={isNeedsRestock}
              onCheckedChange={handleNeedsRestockChange}
              className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
              disabled={isRestocked}
            />
          </div>
          {/* メモトグル */}
          <button
            type="button"
            className="flex items-center justify-center w-6 h-9 rounded"
            onClick={() => setIsMemoOpen((prev) => !prev)}
            tabIndex={-1}
            aria-label={LABELS.TOGGLE_MEMO}
          >
            {isMemoOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
          </button>
        </div>
        {/* 2行目：在庫数・補充数（トグルON時のみ） */}
        {isMemoOpen && (
          <div className="flex gap-2">
            <div className="flex flex-col flex-1">
              <label htmlFor={`stock-${item.item_id}`} className={`text-xs ${textGray}`}>
                {LABELS.CURRENT_STOCK}
              </label>
              <Input
                id={`stock-${item.item_id}`}
                type="number"
                value={currentStock === 0 ? '' : currentStock}
                onChange={handleStockChange}
                min={0}
                className="h-9 w-full text-right text-base"
                placeholder={NUMBER_PLACEHOLDER.STOCK}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor={`restock-${item.item_id}`} className={`text-xs ${textGray}`}>
                {LABELS.REPLENISHMENT_COUNT}
              </label>
              <Input
                id={`restock-${item.item_id}`}
                type="number"
                value={restockAmount === 0 ? '' : restockAmount}
                onChange={handleRestockChange}
                min={0}
                className="h-9 w-full text-right text-base"
                placeholder={NUMBER_PLACEHOLDER.RESTOCK}
              />
            </div>
          </div>
        )}
        {/* 3行目：メモ欄（トグルON時のみ） */}
        {isMemoOpen && (
          <div>
            <label htmlFor={`memo-${item.item_id}`} className={`text-xs ${textGray}`}>
              {LABELS.MEMO}
            </label>
            <TextareaAutosize
              id={`memo-${item.item_id}`}
              value={memo}
              onChange={handleMemoChange}
              className="w-full rounded border border-gray-300 bg-background text-base p-2"
              placeholder=""
              minRows={1}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
