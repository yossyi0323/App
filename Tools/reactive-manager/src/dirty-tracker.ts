import { Versionable } from './types';

/**
 * Track dirty (changed) items by ID
 */
export class DirtyTracker<T extends Versionable> {
  private dirtyItems = new Map<string, T>();

  /**
   * Mark item as dirty (changed)
   */
  markDirty(id: string, data: T): void {
    this.dirtyItems.set(id, data);
  }

  /**
   * Mark item as saved (remove from dirty list)
   */
  markSaved(id: string): void {
    this.dirtyItems.delete(id);
  }

  /**
   * Check if item is dirty
   */
  isDirty(id: string): boolean {
    return this.dirtyItems.has(id);
  }

  /**
   * Get dirty item by ID
   */
  getDirtyItem(id: string): T | undefined {
    return this.dirtyItems.get(id);
  }

  /**
   * Get all dirty items
   */
  getDirtyItems(): Map<string, T> {
    return new Map(this.dirtyItems);
  }

  /**
   * Check if there are any dirty items
   */
  hasDirtyItems(): boolean {
    return this.dirtyItems.size > 0;
  }

  /**
   * Get count of dirty items
   */
  getDirtyCount(): number {
    return this.dirtyItems.size;
  }

  /**
   * Clear all dirty items
   */
  clear(): void {
    this.dirtyItems.clear();
  }

  /**
   * Get all dirty IDs
   */
  getDirtyIds(): string[] {
    return Array.from(this.dirtyItems.keys());
  }
}

