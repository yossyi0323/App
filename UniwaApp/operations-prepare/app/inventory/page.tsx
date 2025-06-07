'use client';

import { useState, useEffect, useRef } from 'react';
import { DateSelector } from '@/components/date-selector';
import { InventoryItemCard } from '@/components/inventory/inventory-item-card';
import { PlaceSelector } from '@/components/inventory/place-selector';
import { getPlaces, getItemsByDestination, getInventoryStatusByDate, saveInventoryStatusesBulk } from '@/lib/db-service';
import type { Place, InventoryStatus, InventoryStatusViewModel } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getCode } from '@/lib/utils/enum-utils';
import { isEnumCode } from '@/lib/utils/enum-utils';
import { ERROR, WARNING, INFO, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { MdCheck, MdCheckCircle } from 'react-icons/md';
import type { EnumCode } from '@/lib/utils/enum-utils';
import { AutoSaveManager } from '@/lib/utils/auto-save-utils';
import { getDirtyInventoryStatuses, createInventoryStatusFromViewModel } from '@/lib/utils/inventory-status-utils';
import { AutoSaveWrapper } from '@/components/common/auto-save-wrapper';
import { AUTOSAVE } from '@/lib/constants/constants';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { toEnumCode } from '@/lib/utils/enum-utils';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';

/**
 * 業務ロジック：補充要否を判定する
 */
function isRequired(checked: boolean): EnumCode<typeof REPLENISHMENT_STATUS> {
  return checked
    ? getCode(REPLENISHMENT_STATUS, 'REQUIRED')
    : getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED');
}

/**
 * 業務ロジック：補充要否に応じて作成ステータスを判定する
 * @param checked 補充要否（true: 要補充, false: 補充不要）
 * @param prevPreparationStatus 変更前の作成ステータス
 * @returns 新しい作成ステータス（変更不要ならprevPreparationStatusを返す）
 */
function getNextPreparationStatus(
  checked: boolean,
  prevPreparationStatus: EnumCode<typeof PREPARATION_STATUS>
): EnumCode<typeof PREPARATION_STATUS> {
  if (checked) {
    // 補充不要→要補充
    if (isEnumCode(PREPARATION_STATUS, prevPreparationStatus, 'NOT_REQUIRED')) {
      return getCode(PREPARATION_STATUS, 'REQUIRED');
    }
    // 依頼済・作成済は変更しない
    return prevPreparationStatus;
  } else {
    // 要補充→補充不要
    if (isEnumCode(PREPARATION_STATUS, prevPreparationStatus, 'REQUIRED')) {
      return getCode(PREPARATION_STATUS, 'NOT_REQUIRED');
    }
    // 依頼済・作成済は変更しない
    return prevPreparationStatus;
  }
}

/**
 * 業務ロジック：このitemが「確認済」かどうかを判定する
 * - check_statusがCONFIRMEDならtrue
 * - 未設定時はUNCONFIRMED扱い
 */
function isItemConfirmed(status: InventoryStatus | null | undefined): boolean {
  const checkStatus = status?.check_status ?? getCode(INVENTORY_STATUS, 'UNCONFIRMED');
  return isEnumCode(INVENTORY_STATUS, checkStatus, 'CONFIRMED');
}

/**
 * 業務ロジック：品目の状態を更新する
 */
function updateItemStatus(
  items: InventoryStatusViewModel[],
  itemId: string,
  field: keyof InventoryStatus,
  value: InventoryStatus[keyof InventoryStatus],
  date: Date
): InventoryStatusViewModel[] {
  return items.map(viewModel => {
    if (viewModel.item.item_id !== itemId) return viewModel;
    return {
      ...viewModel,
      status: createInventoryStatusFromViewModel(viewModel, date, { [field]: value })
    };
  });
}

export default function InventoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [items, setItems] = useState<InventoryStatusViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef<InventoryStatusViewModel[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  const autoSaveRef = useRef<AutoSaveManager | null>(null);
  
  // 初期表示時に場所一覧を読み込む
  useEffect(() => {
    async function loadPlaces() {
      try {
        const { data, error } = await getPlaces();
        if (error) throw error;
        
        if (data) {
          setPlaces(data);
          // 最初の補充先を自動選択
          const firstDestination = data.find(place => isEnumCode(PLACE_TYPE, place.place_type, 'DESTINATION'));
          if (firstDestination) {
            setSelectedPlaceId(firstDestination.place_id);
          }
        }
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.LOCATION) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPlaces();
  }, []);
  
  // 選択された場所が変更されたら品目と在庫ステータスを読み込む
  useEffect(() => {
    if (!selectedPlaceId) return;
    
    async function loadItems() {
      setIsLoading(true);
      try {
        if (!selectedPlaceId) return;
        
        // 品目一覧を取得
        const { data: items, error: itemsError } = await getItemsByDestination(selectedPlaceId);
        if (itemsError) throw itemsError;
        
        // 在庫ステータスを取得
        const date = selectedDate.toISOString().split('T')[0];
        const { data: statuses, error: statusError } = await getInventoryStatusByDate(date);
        if (statusError) throw statusError;
        
        // 画面表示用のデータにマッピング
        const viewModels = items?.map(item => ({
          item,
          status: statuses?.find(status => status.item_id === item.item_id) || null
        })) || [];
        
        setItems(viewModels);
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadItems();
  }, [selectedPlaceId, selectedDate]);
  
  // AutoSaveManagerの初期化
  useEffect(() => {
    if (!selectedPlaceId || !selectedDate) return;

    const storageKey = `inventory_${selectedDate.toISOString().split('T')[0]}_${selectedPlaceId}`;
    autoSaveRef.current = new AutoSaveManager({
      getData: () => itemsRef.current
        .map(vm => vm.status)
        .filter((status): status is InventoryStatus => !!status),
      saveData: async (dirtyStatuses) => {
        await saveInventoryStatusesBulk(dirtyStatuses);
      },
      getDirtyItems: getDirtyInventoryStatuses,
      storageKey,
      initialData: [],
      debounceMs: AUTOSAVE.DEBOUNCE_MS
    });

    // オフライン復帰時の再送信
    const handleOnline = () => {
      autoSaveRef.current?.retryFailedSaves();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      autoSaveRef.current = null; // クリーンアップ時にnullに設定
    };
  }, [selectedPlaceId, selectedDate]);
  
  // itemsの変更を監視して自動保存をトリガー
  useEffect(() => {
    if (!autoSaveRef.current) return;
    autoSaveRef.current.markDirty();
  }, [items]);

  // バリデーション例（業務日付・補充先必須）
  useEffect(() => {
    if (!selectedDate) setError($msg(ERROR.E10010, LABELS.BUSINESS_DATE));
    else if (!selectedPlaceId) setError($msg(ERROR.E10010, LABELS.PLACE));
    else setError(null);
  }, [selectedDate, selectedPlaceId]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handlePlaceChange = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };
  
  // 個別アイテムのチェック状態更新
  const handleCheckChange = (itemId: string, checked: boolean) => {
    handleItemStatusChange(
      itemId,
      'check_status',
      checked 
        ? getCode(INVENTORY_STATUS, 'CONFIRMED')
        : getCode(INVENTORY_STATUS, 'UNCONFIRMED')
    );
  };

  // 全品目の確認状態を一括更新
  const handleCheckChangeAll = () => {
    // 全件確認済みかどうかを判定
    const isAllConfirmed = items.every(viewModel => isItemConfirmed(viewModel.status));
    // 全件確認済みなら未確認に、そうでなければ確認済みに
    const isConfirmed = !isAllConfirmed;
    items.forEach(viewModel => {
      handleCheckChange(viewModel.item.item_id, isConfirmed);
    });
  };

  // 子からの状態変更を親のitemsに反映
  const handleItemStatusChange = (itemId: string, field: keyof InventoryStatus, value: InventoryStatus[keyof InventoryStatus]) => {
    setItems(prev => {
      const updated = updateItemStatus(prev, itemId, field, value, selectedDate);
      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        autoSaveRef.current?.markDirty();
      }
      return updated;
    });
  };

  // 選択された場所の名前を取得
  const selectedPlace = places.find(place => place.place_id === selectedPlaceId);
  
  return (
    <AutoSaveWrapper autoSaveManager={autoSaveRef.current}>
      <div>
        <h1 className="text-xl font-bold mb-4">{LABELS.INVENTORY_CHECK}</h1>
        <DateSelector date={selectedDate} onDateChange={handleDateChange} />
        <div className="mb-3">
          <PlaceSelector
            places={places}
            selectedPlaceId={selectedPlaceId}
            onPlaceChange={handlePlaceChange}
            type={getCode(PLACE_TYPE, 'DESTINATION')}
            className="w-full"
          />
        </div>
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <LoadingIndicator message={$msg(INFO.I30030)} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedPlaceId 
                ? $msg(WARNING.W20010)
                : $msg(INFO.I30020)}
            </p>
          </div>
        ) : (
          <div>
            {/* ヘッダー行 */}
            <div className="flex items-center px-2 py-2 border-b border-border text-sm mb-2">
              <button
                type="button"
                className="pl-2 rounded-full transition-colors"
                onClick={handleCheckChangeAll}
              >
                <MdCheck size={25} />
              </button>
              <span className="text-xs ml-2">{LABELS.BULK_CHECK}</span>
              <div className="flex-1" />
              <div className="text-xs flex flex-col items-center gap-1 mr-11">
                <span>{LABELS.NEEDS_RESTOCK}</span>
              </div>
            </div>
            {/* 在庫リスト */}
            {items.map(viewModel => {
              const status = createInventoryStatusFromViewModel(viewModel, selectedDate);
              const statusChange = (property: keyof InventoryStatus, value: InventoryStatus[keyof InventoryStatus]) => 
                handleItemStatusChange(viewModel.item.item_id, property, value);
              return (
                <InventoryItemCard
                  key={viewModel.item.item_id}
                  item={viewModel.item}
                  date={selectedDate.toISOString().split('T')[0]}
                  currentStock={status.current_stock}
                  restockAmount={status.replenishment_count}
                  replenishmentStatus={toEnumCode(REPLENISHMENT_STATUS, status.replenishment_status)}
                  memo={status.memo}
                  isChecked={isItemConfirmed(viewModel.status)}
                  onStockChange={value => statusChange('current_stock', value)}
                  onRestockChange={value => statusChange('replenishment_count', value)}
                  onNeedsRestockChange={checked => {
                    statusChange('replenishment_status', isRequired(checked))
                    statusChange('preparation_status', getNextPreparationStatus(checked, toEnumCode(PREPARATION_STATUS, status.preparation_status)))
                  }}
                  onMemoChange={value => statusChange('memo', value)}
                  onCheckChange={checked => handleCheckChange(viewModel.item.item_id, checked)}
                />
              );
            })}
          </div>
        )}
      </div>
    </AutoSaveWrapper>
  );
}