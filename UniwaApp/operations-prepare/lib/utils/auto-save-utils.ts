import { debounce } from 'lodash';
import { MESSAGES, $msg, ERROR } from '@/lib/constants/messages';

export interface AutoSaveConfig<T, R = void> {
  // 保存対象のデータを取得する関数
  getData: () => T;
  // 保存処理を実行する関数
  saveData: (data: T) => Promise<R>;
  // ローカルストレージのキー
  storageKey: string;
  // debounceの待機時間（ミリ秒）
  debounceMs?: number;
  // 差分検知のための比較関数（オプション）
  isEqual?: (a: T, b: T) => boolean;
  getDirtyItems?: (prev: T, next: T) => T;
  initialData?: T;
}

export class AutoSaveManager<T, R = void> {
  private config: AutoSaveConfig<T, R>;
  private isDirty: boolean = false;
  private lastSavedData: T;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(config: AutoSaveConfig<T, R>) {
    this.config = {
      debounceMs: 3000,
      isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      getDirtyItems: (prev, next) => next, // デフォルトは全件
      ...config,
    };
    this.lastSavedData = config.initialData ?? this.config.getData();
    this.loadLastSavedData();
  }

  // 現在のデータを取得
  public getData(): T {
    return this.config.getData();
  }

  // 即時保存を実行
  public async saveNow(): Promise<void> {
    const currentData = this.getData();
    const dirty = this.config.getDirtyItems!(this.lastSavedData, currentData);
    if (Array.isArray(dirty) && dirty.length === 0) return;
    await this.config.saveData(dirty);
    this.lastSavedData = currentData;
    this.isDirty = false;
    this.removeFromLocalStorage();
  }

  // 保存が必要かどうかを確認
  public needsSave(): boolean {
    const currentData = this.getData();
    return this.isDirty || !this.config.isEqual!(currentData, this.lastSavedData);
  }

  // 変更を検知
  public markDirty(): void {
    this.isDirty = true;
    this.scheduleSave();
  }

  // 保存をスケジュール
  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveData();
    }, this.config.debounceMs);
  }

  // データを保存
  private async saveData(): Promise<void> {
    if (!this.isDirty) return;

    const currentData = this.getData();
    const dirty = this.config.getDirtyItems!(this.lastSavedData, currentData);
    if (Array.isArray(dirty) && dirty.length === 0) {
      this.isDirty = false;
      return;
    }
    try {
      await this.config.saveData(dirty);
      this.lastSavedData = currentData;
      this.isDirty = false;
      this.removeFromLocalStorage();
    } catch (error) {
      console.error($msg(ERROR.E10002, '自動保存'), error);
      this.saveToLocalStorage(currentData);
    }
  }

  // ローカルストレージから前回保存内容を読み込み
  private loadLastSavedData(): void {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved) {
        this.lastSavedData = JSON.parse(saved);
      }
    } catch (error) {
      console.error($msg(ERROR.E10001, 'ローカルストレージ'), error);
    }
  }

  // ローカルストレージに一時保存
  private saveToLocalStorage(data: T): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error($msg(ERROR.E10002, 'ローカルストレージ'), error);
    }
  }

  // ローカルストレージから削除
  private removeFromLocalStorage(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error($msg(ERROR.E10004, 'ローカルストレージ'), error);
    }
  }

  // オフライン復帰時の再送信
  public async retryFailedSaves(): Promise<void> {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (!saved) return;

      const data = JSON.parse(saved) as T;
      await this.config.saveData(data);
      // 保存成功時はローカルストレージから削除
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error($msg(ERROR.E10002, '再送信'), error);
    }
  }

  // 変更状態の確認
  public hasChanges(): boolean {
    return this.isDirty;
  }

  // 前回保存時の内容を取得
  public getLastSavedData(): T | null {
    return this.lastSavedData;
  }
}

// 使用例：
/*
// 差分抽出ユーティリティ（例: InventoryStatus用）
import { getDirtyInventoryStatuses } from '@/lib/utils/inventory-status-utils';
import { saveInventoryStatusesBulk } from '@/lib/db-service';

const autoSave = new AutoSaveManager({
  getData: () => items, // 画面側の全件データ
  saveData: async (dirtyItems) => {
    await saveInventoryStatusesBulk(dirtyItems);
  },
  getDirtyItems: getDirtyInventoryStatuses, // 差分抽出ロジックを注入
  storageKey: 'inventory_status_autosave',
  initialData: [] // 初期値
});

// 入力欄の変更時の処理
const handleInputChange = () => {
  autoSave.markDirty();
};
*/
