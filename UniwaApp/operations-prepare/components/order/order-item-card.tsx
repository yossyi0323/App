'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LABELS } from '@/lib/constants/labels';
import { SYMBOLS } from '@/lib/constants/constants';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import type { Item } from '@/lib/types';
import { getDisplayName, isEnumCode } from '@/lib/utils/enum-utils';
import { ORDER_REQUEST_STATUS } from '@/lib/schemas/enums/order-request-status';
import type { EnumCode } from '@/lib/utils/enum-utils';
import TextareaAutosize from 'react-textarea-autosize';
import { Badge } from '@/components/ui/badge';
import isEmpty from 'lodash/isEmpty';

interface OrderItemCardProps {
  item: Item;
  currentStock: number;
  restockAmount: number;
  orderStatus: EnumCode<typeof ORDER_REQUEST_STATUS>;
  memo: string;
  onMemoChange: (value: string) => void;
  onOrderRequestChange: (value: boolean) => void;
}

export function OrderItemCard({
  item,
  currentStock,
  restockAmount,
  orderStatus,
  memo,
  onMemoChange,
  onOrderRequestChange,
}: OrderItemCardProps) {
  // メモ欄を開くべきかの判定ロジックを関数化
  const getShouldOpenMemo = () => !isEmpty(memo);

  const [isMemoOpen, setIsMemoOpen] = useState(getShouldOpenMemo());

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onMemoChange(value);
  };

  const isOrderRequired = isEnumCode(ORDER_REQUEST_STATUS, orderStatus, 'REQUIRED');
  const highlightClass = isOrderRequired ? 'bg-black text-white dark:bg-white dark:text-black' : '';

  return (
    <Card className="mb-3 overflow-hidden relative bg-background">
      <CardContent className="p-4 relative z-20">
        <div className="flex items-center gap-2 w-full">
          {/* 品物名＋在庫数・補充数バッジ（中央） */}
          <div className="flex-1 min-w-0 inline-flex flex-wrap">
            <span className="block text-sm font-medium break-words whitespace-normal">
              {item.item_name}
            </span>
            <span className="flex flex-row flex-wrap gap-2 mx-1 my-1">
              {currentStock ? (
                <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 align-middle">
                  {LABELS.CURRENT_STOCK}
                  {SYMBOLS.COLON}
                  {currentStock}
                </Badge>
              ) : null}
              {restockAmount ? (
                <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 align-middle">
                  {LABELS.REPLENISHMENT_COUNT}
                  {SYMBOLS.COLON}
                  {restockAmount}
                </Badge>
              ) : null}
            </span>
          </div>
          {/* 右端：発注依頼チェック＋メモトグル */}
          <div className="flex-shrink-0 ml-2 flex items-center gap-2">
            {/* 発注依頼チェックボックス */}
            <div className="flex items-center gap-1">
              <Checkbox
                checked={isEnumCode(ORDER_REQUEST_STATUS, orderStatus, 'REQUESTED')}
                onCheckedChange={(checked) => onOrderRequestChange(!!checked)}
                className="h-5 w-5"
              />
            </div>
            {/* メモトグル */}
            <button
              type="button"
              className="flex items-center justify-center w-6 h-6 rounded"
              onClick={() => setIsMemoOpen((prev) => !prev)}
              tabIndex={-1}
              aria-label={LABELS.TOGGLE_MEMO}
            >
              {isMemoOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </button>
          </div>
        </div>
        {/* メモ欄 */}
        {isMemoOpen && (
          <div className="mt-2">
            <div className="flex flex-col">
              <label htmlFor={`memo-${item.item_id}`} className="text-xs mb-1 ml-1">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
