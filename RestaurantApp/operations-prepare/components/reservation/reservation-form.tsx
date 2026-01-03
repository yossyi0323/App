'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useReservationStorage, useReservationNoteStorage } from '@/lib/local-storage';
import { useAutoSave } from '@/lib/hooks/use-auto-save';

interface ReservationFormProps {
  date: string;
}

export function ReservationForm({ date }: ReservationFormProps) {
  const { note, updateNote } = useReservationNoteStorage(date);
  const { reservations, addReservation, updateReservation, removeReservation } =
    useReservationStorage(date);
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState<number | ''>('');

  // Auto-save for reservation notes
  const noteAutoSave = useAutoSave({
    onSave: (value) => {
      updateNote(value);
    },
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    noteAutoSave.updateValue(value);
  };

  const handleAddReservation = () => {
    if (newItemName.trim() && newQuantity !== '') {
      addReservation({
        date,
        itemName: newItemName.trim(),
        quantity: Number(newQuantity),
      });
      setNewItemName('');
      setNewQuantity('');
    }
  };

  const handleQuantityChange = (index: number, value: number | '') => {
    if (value !== '') {
      const updatedReservation = {
        ...reservations[index],
        quantity: Number(value),
      };
      updateReservation(index, updatedReservation);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">予約状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reservation-note" className="mb-1 block">
                予約メモ
              </Label>
              <Textarea
                id="reservation-note"
                value={note}
                onChange={handleNoteChange}
                onBlur={noteAutoSave.handleBlur}
                placeholder="翌日の予約に関するメモを入力してください"
                className="h-24 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="block">予約品目</Label>

              {reservations.length > 0 && (
                <div className="space-y-2">
                  {reservations.map((reservation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">{reservation.itemName}</div>
                      <Input
                        type="number"
                        value={reservation.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className="w-20"
                        min={1}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReservation(index)}
                        className="h-8 w-8"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="品目名"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="数量"
                  value={newQuantity}
                  onChange={(e) =>
                    setNewQuantity(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-20"
                  min={1}
                />
                <Button
                  onClick={handleAddReservation}
                  disabled={!newItemName || newQuantity === ''}
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
