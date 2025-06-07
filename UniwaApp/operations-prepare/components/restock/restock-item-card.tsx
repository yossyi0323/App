'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/lib/hooks/use-auto-save';
import { useInventoryStatusStorage } from '@/lib/local-storage';
import type { Item } from '@/lib/types';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';
import { getCode, isEnumCode } from '@/lib/utils/enum-utils';

interface RestockItemCardProps {
  item: Item;
  date: string;
  onStatusChange?: (itemId: string, field: string, value: any) => void;
  showCreateOptions?: boolean;
}

export function RestockItemCard({ 
  item, 
  date, 
  onStatusChange,
  showCreateOptions = false
}: RestockItemCardProps) {
  const { status, updateStatus, isLoading } = useInventoryStatusStorage(date, item.item_id);
  
  const [isRestocked, setIsRestocked] = useState(false);
  const [isCreationRequested, setIsCreationRequested] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [notes, setNotes] = useState('');

  // Initialize form with localStorage data
  useEffect(() => {
    if (!isLoading && status) {
      setIsRestocked(isEnumCode(REPLENISHMENT_STATUS, status.replenishment_status, 'COMPLETED'));
      if (showCreateOptions) {
        setIsCreated(isEnumCode(PREPARATION_STATUS, status.preparation_status, 'COMPLETED'));
        setIsCreationRequested(isEnumCode(PREPARATION_STATUS, status.preparation_status, 'REQUESTED'));
      }
      setNotes(status.memo || '');
    }
  }, [isLoading, status, showCreateOptions]);

  // Auto-save setup for notes
  const notesAutoSave = useAutoSave({
    onSave: (value) => {
      const newStatus = {
        date,
        item_id: item.item_id,
        memo: value,
      };
      updateStatus(newStatus);
      onStatusChange?.(item.item_id, 'memo', value);
    },
  });

  const handleRestockedChange = (checked: boolean) => {
    setIsRestocked(checked);
    const newStatus = {
      date,
      item_id: item.item_id,
      replenishment_status: checked
        ? getCode(REPLENISHMENT_STATUS, 'COMPLETED')
        : getCode(REPLENISHMENT_STATUS, 'REQUIRED'),
    };
    updateStatus(newStatus);
    onStatusChange?.(
      item.item_id,
      'replenishment_status',
      checked
        ? getCode(REPLENISHMENT_STATUS, 'COMPLETED')
        : getCode(REPLENISHMENT_STATUS, 'REQUIRED')
    );
  };

  const handleCreatedChange = (checked: boolean) => {
    setIsCreated(checked);
    setIsCreationRequested(false);
    const newStatus = {
      date,
      item_id: item.item_id,
      preparation_status: checked
        ? getCode(PREPARATION_STATUS, 'COMPLETED')
        : getCode(PREPARATION_STATUS, 'REQUIRED'),
    };
    updateStatus(newStatus);
    onStatusChange?.(
      item.item_id,
      'preparation_status',
      checked
        ? getCode(PREPARATION_STATUS, 'COMPLETED')
        : getCode(PREPARATION_STATUS, 'REQUIRED')
    );
  };

  const handleCreationRequestedChange = (checked: boolean) => {
    setIsCreationRequested(checked);
    setIsCreated(false);
    const newStatus = {
      date,
      item_id: item.item_id,
      preparation_status: checked
        ? getCode(PREPARATION_STATUS, 'REQUESTED')
        : getCode(PREPARATION_STATUS, 'REQUIRED'),
    };
    updateStatus(newStatus);
    onStatusChange?.(
      item.item_id,
      'preparation_status',
      checked
        ? getCode(PREPARATION_STATUS, 'REQUESTED')
        : getCode(PREPARATION_STATUS, 'REQUIRED')
    );
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    notesAutoSave.updateValue(value);
  };

  // Status badges
  const getRestockBadge = () => {
    if (isRestocked) {
      return <Badge className="bg-green-500">補充済</Badge>;
    }
    return <Badge variant="secondary">要補充</Badge>;
  };

  const getCreateBadge = () => {
    if (isCreated) {
      return <Badge className="bg-green-500">作成済</Badge>;
    }
    if (isCreationRequested) {
      return <Badge className="bg-blue-500">依頼済</Badge>;
    }
    return <Badge variant="secondary">要作成</Badge>;
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Label className="text-base font-medium">
            {item.item_name}
          </Label>
          {showCreateOptions ? getCreateBadge() : getRestockBadge()}
        </div>

        {status && (
          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">現在の在庫:</span>
              <span className="ml-1 font-medium">{status.current_stock || 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">補充数:</span>
              <span className="ml-1 font-medium">{status.replenishment_count || 0}</span>
            </div>
          </div>
        )}

        <div className="mt-3">
          <Label htmlFor={`notes-${item.item_id}`} className="text-xs mb-1 block">メモ</Label>
          <Textarea
            id={`notes-${item.item_id}`}
            value={notes}
            onChange={handleNotesChange}
            onBlur={notesAutoSave.handleBlur}
            placeholder="補充や作成に関するメモを入力"
            className="h-20 resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex p-4 pt-0">
        {showCreateOptions ? (
          <div className="flex gap-4 w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`created-${item.item_id}`}
                checked={isCreated}
                onCheckedChange={handleCreatedChange}
              />
              <Label 
                htmlFor={`created-${item.item_id}`}
                className="text-sm cursor-pointer"
              >
                作成済
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`creation-requested-${item.item_id}`}
                checked={isCreationRequested}
                onCheckedChange={handleCreationRequestedChange}
              />
              <Label 
                htmlFor={`creation-requested-${item.item_id}`}
                className="text-sm cursor-pointer"
              >
                作成依頼済
              </Label>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`restocked-${item.item_id}`}
              checked={isRestocked}
              onCheckedChange={handleRestockedChange}
            />
            <Label 
              htmlFor={`restocked-${item.item_id}`}
              className="text-sm cursor-pointer"
            >
              補充済にする
            </Label>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}