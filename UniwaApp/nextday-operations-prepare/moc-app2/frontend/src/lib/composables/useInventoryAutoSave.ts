import { ref, watch, onUnmounted, computed, type Ref } from 'vue';
import { createReactiveManager, SaveState } from '@tools/reactive-manager';
import type { InventoryStatus, InventoryStatusViewModel } from '@/types';
import { inventoryStatusApi } from '@/lib/api/inventory-status';
import { format } from 'date-fns';

const ENTITY_KEY = 'inventoryStatus';

interface UseInventoryAutoSaveOptions {
  items: Ref<InventoryStatusViewModel[]>;
  selectedPlaceId: Ref<string | null>;
  selectedDate: Ref<Date>;
  onError?: (error: string) => void;
}

export function useInventoryAutoSave({
  items,
  selectedPlaceId,
  selectedDate,
  onError,
}: UseInventoryAutoSaveOptions) {
  const saveState = ref<SaveState>(SaveState.IDLE);
  const saveMessage = ref('');

  const itemsRef = items;

  // ReactiveManagerの作成（シングルトンとして使用）
  const manager = createReactiveManager();

  // エンティティの登録
  manager.register<InventoryStatus>(ENTITY_KEY, {
    save: async (data: InventoryStatus) => {
      const saved = await inventoryStatusApi.save(data);
      return saved;
    },
    debounceMs: 1000,
    onStateChange: (state, data) => {
      if (state === SaveState.SAVING) {
        saveState.value = SaveState.SAVING;
        saveMessage.value = '保存中...';
      } else if (state === SaveState.SAVED) {
        saveState.value = SaveState.SAVED;
        saveMessage.value = '保存しました';
        setTimeout(() => {
          saveMessage.value = '';
        }, 2000);
      } else if (state === SaveState.ERROR) {
        saveState.value = SaveState.ERROR;
        saveMessage.value = '保存エラー';
      } else if (state === SaveState.CONFLICT) {
        saveState.value = SaveState.CONFLICT;
        saveMessage.value = '他のユーザーが更新しました。ページをリロードしてください。';
        onError?.(saveMessage.value);
      }
    },
    onSaved: (saved: InventoryStatus) => {
      // 保存後のレスポンスで返ってきたバージョン番号をitemsに反映
      isUpdatingFromSave.value = true;

      try {
        itemsRef.value.forEach((vm) => {
          if (vm.status?.id === saved.id) {
            const currentStatus = vm.status;
            // 保存後のレスポンスで返ってきた最新の状態を反映
            // ユーザーがさらに編集している場合は、その値を優先（ただしバージョンは保存済みの値を使用）
            vm.status = {
              ...saved,
              // ユーザーがさらに編集した値があれば優先（ただしバージョンは保存済みの値を使用）
              inventoryCount: currentStatus.inventoryCount ?? saved.inventoryCount,
              replenishmentCount: currentStatus.replenishmentCount ?? saved.replenishmentCount,
              replenishmentNote: currentStatus.replenishmentNote ?? saved.replenishmentNote,
              inventoryCheckStatus:
                currentStatus.inventoryCheckStatus ?? saved.inventoryCheckStatus,
              replenishmentStatus: currentStatus.replenishmentStatus ?? saved.replenishmentStatus,
              preparationStatus: currentStatus.preparationStatus ?? saved.preparationStatus,
              orderRequestStatus: currentStatus.orderRequestStatus ?? saved.orderRequestStatus,
              version: saved.version, // バージョンは必ず保存済みの値を使用
            };
            // prevStatusesRefを最新の保存済み状態で更新
            prevStatusesRef.value.set(vm.item.id, { ...vm.status });
          }
        });
      } finally {
        // 次のtickでフラグを解除（watchの再発火を防ぐ）
        setTimeout(() => {
          isUpdatingFromSave.value = false;
        }, 0);
      }
    },
    onError: (error: Error) => {
      saveState.value = SaveState.ERROR;
      saveMessage.value = '保存エラー';
      console.error(error);
      onError?.(error.message || '保存に失敗しました');
    },
    onConflict: (data: InventoryStatus) => {
      saveState.value = SaveState.CONFLICT;
      saveMessage.value = '他のユーザーが更新しました。ページをリロードしてください。';
      onError?.(saveMessage.value);
    },
  });

  // 前回の値を記録して差分を検出
  const prevStatusesRef = ref<Map<string, InventoryStatus>>(new Map());
  const isInitialized = ref(false);
  const isUpdatingFromSave = ref(false);

  watch(
    () => itemsRef.value,
    () => {
      // 保存後の更新処理中はスキップ
      if (isUpdatingFromSave.value) {
        return;
      }

      // 初回読み込み時は前回値を設定するだけ
      if (!isInitialized.value) {
        itemsRef.value.forEach((vm) => {
          if (vm.status && vm.status.id) {
            prevStatusesRef.value.set(vm.item.id, { ...vm.status });
          }
        });
        isInitialized.value = true;
        return;
      }

      itemsRef.value.forEach((vm) => {
        if (!vm.status) return;

        const status = vm.status;
        const prevStatus = prevStatusesRef.value.get(vm.item.id);

        // 変更を検出（itemオブジェクトを除外して比較）
        const statusWithoutItem = { ...status, item: undefined };
        const prevStatusWithoutItem = prevStatus ? { ...prevStatus, item: undefined } : null;

        const hasChanged =
          !prevStatusWithoutItem ||
          JSON.stringify(statusWithoutItem) !== JSON.stringify(prevStatusWithoutItem);

        if (hasChanged) {
          // IDがない場合は新規作成のため、まず保存してIDを取得
          if (!status.id || status.id === '') {
            // 最小限のデータで新規作成
            const newStatus: Partial<InventoryStatus> = {
              businessDate: format(selectedDate.value, 'yyyy-MM-dd'),
              itemId: vm.item.id,
              inventoryCheckStatus: status.inventoryCheckStatus ?? '01', // UNCONFIRMED
              replenishmentStatus: status.replenishmentStatus ?? '99', // NOT_REQUIRED
              preparationStatus: status.preparationStatus ?? '99', // NOT_REQUIRED
              orderRequestStatus: status.orderRequestStatus ?? '99', // NOT_REQUIRED
              inventoryCount: status.inventoryCount ?? 0,
              replenishmentCount: status.replenishmentCount ?? 0,
              replenishmentNote: status.replenishmentNote ?? '',
              version: 0,
            };

            inventoryStatusApi
              .create(newStatus)
              .then((saved) => {
                vm.status = saved;
                prevStatusesRef.value.set(vm.item.id, { ...saved });
              })
              .catch((error) => {
                console.error('Failed to create inventory status:', error);
                onError?.(error.message || '新規作成に失敗しました');
              });
          } else {
            // IDがある場合はReactiveManagerに登録して保存
            // prevStatusesRefから最新のバージョンを取得して、statusのバージョンを更新
            const prevStatus = prevStatusesRef.value.get(vm.item.id);
            if (prevStatus && prevStatus.version !== undefined) {
              // 保存済みのバージョンを使用（保存済みの方が新しい可能性がある）
              status.version = prevStatus.version;
            }
            // ReactiveManagerに保存を依頼（debounce付き）
            manager.save(ENTITY_KEY, status);
          }
        } else if (prevStatus) {
          // 変更がない場合も前回値を更新（参照を維持）
          prevStatusesRef.value.set(vm.item.id, { ...prevStatus });
        }
      });
    },
    { deep: true }
  );

  onUnmounted(async () => {
    if (manager.hasUnsavedChanges()) {
      try {
        await manager.forceSaveAll();
      } catch (error) {
        console.error('Failed to force save on unmount:', error);
      }
    }
  });

  return {
    manager,
    autoSave: manager, // 後方互換性のため
    saveState,
    saveMessage,
  };
}
