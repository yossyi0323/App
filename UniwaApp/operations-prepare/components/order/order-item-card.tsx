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

interface OrderItemCardProps {
  item: Item;
  date: string;
  onStatusChange?: (itemId: string, field: string, value: any) => void;
}

export function OrderItemCard({ item, date, onStatusChange }: OrderItemCardProps) {
  const { status, updateStatus, isLoading } = useInventoryStatusStorage(date, item.id);
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [notes, setNotes] = useState('');

  // Initialize form with localStorage data
  useEffect(() => {
    if (!isLoading && status) {
      setIsOrdered(status.orderStatus === 'ordered');
      setNotes(status.notes || '');
    }
  }, [isLoading, status]);

  // Auto-save setup for notes
  const notesAutoSave = useAutoSave({
    onSave: (value) => {
      const newStatus = {
        date,
        itemId: item.id,
        notes: value,
      };
      updateStatus(newStatus);
      onStatusChange?.(item.id, 'notes', value);
    },
  });

  const handleOrderedChange = (checked: boolean) => {
    setIsOrdered(checked);
    
    const newStatus = {
      date,
      itemId: item.id,
      orderStatus: checked ? 'ordered' : 'needs-order',
    };
    
    updateStatus(newStatus);
    onStatusChange?.(item.id, 'orderStatus', checked ? 'ordered' : 'needs-order');
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    notesAutoSave.updateValue(value);
  };

  // Status badge
  const getOrderBadge = () => {
    if (isOrdered) {
      return <Badge className="bg-green-500">発注依頼済</Badge>;
    }
    return <Badge variant="secondary">要発注依頼</Badge>;
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Label className="text-base font-medium">
            {item.name}
          </Label>
          {getOrderBadge()}
        </div>

        {status && (
          <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">現在の在庫:</span>
              <span className="ml-1 font-medium">{status.currentStock || 0}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">補充数:</span>
              <span className="ml-1 font-medium">{status.restockAmount || 0}</span>
            </div>
          </div>
        )}

        <div className="mt-3">
          <Label htmlFor={`notes-${item.id}`} className="text-xs mb-1 block">発注メモ</Label>
          <Textarea
            id={`notes-${item.id}`}
            value={notes}
            onChange={handleNotesChange}
            onBlur={notesAutoSave.handleBlur}
            placeholder="発注依頼に関するメモを入力"
            className="h-20 resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex p-4 pt-0">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`ordered-${item.id}`}
            checked={isOrdered}
            onCheckedChange={handleOrderedChange}
          />
          <Label 
            htmlFor={`ordered-${item.id}`}
            className="text-sm cursor-pointer"
          >
            発注依頼済にする
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}