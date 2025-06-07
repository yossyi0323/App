import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LABELS } from '@/lib/constants/labels';
import { SYMBOLS } from '@/lib/constants/constants';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import type { Item } from '@/lib/types';
import { isEnumCode, getCodeAsEnumCode, getDisplayName } from '@/lib/utils/enum-utils';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/schemas/enums/order-request-status';
import type { EnumCode } from '@/lib/utils/enum-utils';
import TextareaAutosize from 'react-textarea-autosize';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import isEmpty from 'lodash/isEmpty';
import { PREPARATION_PATTERN } from '@/lib/schemas/enums/preparation-pattern';
import { Button } from '@/components/ui/button';

interface ReplenishItemCardProps {
  item: Item;
  date: string;
  currentStock: number;
  restockAmount: number;
  replenishmentStatus: EnumCode<typeof REPLENISHMENT_STATUS>;
  preparationStatus: EnumCode<typeof PREPARATION_STATUS>;
  orderStatus: EnumCode<typeof ORDER_REQUEST_STATUS>;
  memo: string;
  isChecked: boolean;
  patternType?: EnumCode<typeof PREPARATION_PATTERN>;
  onStockChange: (value: number) => void;
  onRestockChange: (value: number) => void;
  onMemoChange: (value: string) => void;
  onCheckChange: (value: boolean) => void;
  onNeedsRestockChange: (value: boolean) => void;
  onOrderRequest: () => void;
  onPreparationStatusChange: (value: EnumCode<typeof PREPARATION_STATUS>) => void;
}

export function ReplenishItemCard(
  { 
    item,
    currentStock, 
    restockAmount, 
    preparationStatus, 
    orderStatus, 
    memo, 
    patternType, 
    replenishmentStatus,
    onMemoChange, 
    onOrderRequest, 
    onPreparationStatusChange,
    onNeedsRestockChange
  }: ReplenishItemCardProps) {
  // メモ欄を開くべきかの判定ロジックを関数化
  const getShouldOpenMemo = () =>
    isEnumCode(ORDER_REQUEST_STATUS, orderStatus, 'REQUIRED') ||
    !isEmpty(memo);

  const [isMemoOpen, setIsMemoOpen] = useState(getShouldOpenMemo());

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onMemoChange(value);
  };

  const isCreationRequired = isEnumCode(PREPARATION_STATUS, preparationStatus, 'REQUIRED');
  const isOrderRequired = isEnumCode(ORDER_REQUEST_STATUS, orderStatus, 'REQUIRED');
  const highlightClass = (isCreationRequired || isOrderRequired)
    ? 'bg-black text-white dark:bg-white dark:text-black'
    : '';

  const isNeedsRestock = isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED');

  return (
    <Card className="mb-3 overflow-hidden relative bg-background">
      <CardContent className="p-4 relative z-20"> 
        <div className="flex items-center gap-2 w-full">
          {/* 品物名＋在庫数・補充数バッジ（中央） */}
          <div className="flex-1 min-w-0 inline-flex flex-wrap">
            <span className="block text-sm font-medium break-words whitespace-normal">{item.item_name}</span>
            <span className="flex flex-row flex-wrap gap-2 mx-1 my-1">
              {currentStock ? (
                <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 align-middle">
                  {LABELS.CURRENT_STOCK}{SYMBOLS.COLON}{currentStock}
                </Badge>
              ) : null}
              {restockAmount ? (
                <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 align-middle">
                  {LABELS.RESTOCK_AMOUNT}{SYMBOLS.COLON}{restockAmount}
                </Badge>
              ) : null}
            </span>
          </div>
          {/* 右端：トグルボタン＋メモトグル */}
          <div className="flex-shrink-0 ml-2 flex items-center gap-2">
            {/* トグルボタン（要補充 or 要作成セレクト） */}
            {patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'MOVE') ? (
              <Button
                variant={isNeedsRestock ? "default" : "outline"}
                className="w-[90px] h-7 px-3 text-sm rounded-md"
                onClick={() => onNeedsRestockChange(!isNeedsRestock)}
              >
                {getDisplayName(REPLENISHMENT_STATUS, isNeedsRestock ? 'REQUIRED' : 'COMPLETED')}
              </Button>
            ) : patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'CREATION') ? (
              <Select value={preparationStatus} onValueChange={onPreparationStatusChange}>
                <SelectTrigger className={`
                  w-[90px] h-7 px-3 text-sm rounded-md border border-input bg-background 
                  focus:ring-2 focus:ring-ring focus:outline-none flex items-center justify-between 
                  ${isCreationRequired ? highlightClass : ''}`}> 
                  <SelectValue placeholder={LABELS.PREPARATION_STATUS}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={getCodeAsEnumCode(PREPARATION_STATUS, 'REQUIRED')}>{getDisplayName(PREPARATION_STATUS, 'REQUIRED')}</SelectItem>
                  <SelectItem value={getCodeAsEnumCode(PREPARATION_STATUS, 'REQUESTED')}>{LABELS.REQUESTED}</SelectItem>
                  <SelectItem value={getCodeAsEnumCode(PREPARATION_STATUS, 'COMPLETED')}>{getDisplayName(PREPARATION_STATUS, 'COMPLETED')}</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
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
          <div className="mt-2 flex flex-row items-start gap-2">
            {/* 発注依頼チェックボックス（縦並び・中央揃え） */}
            <div className="flex flex-col items-center flex-shrink-0 gap-1">
              <label className="text-xs">{LABELS.ORDER}</label>
              <Checkbox checked={isOrderRequired} onCheckedChange={onOrderRequest} className="h-5 w-5" />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor={`memo-${item.item_id}`} className="text-xs mb-1 ml-1">{LABELS.MEMO}</label>
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