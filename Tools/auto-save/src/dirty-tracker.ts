/**
 * Track dirty (changed) items by ID
 */
export class DirtyTracker<T> {
  private dirtyItems = new Map<string, T>();
  private savedItems = new Map<string, T>();

  /**
   * Mark item as dirty (changed)
   */
  markDirty(id: string, data: T): void {
    this.dirtyItems.set(id, data);
  }

  /**
   * Mark item as saved
   */
  markSaved(id: string, data: T): void {
    this.dirtyItems.delete(id);
    this.savedItems.set(id, data);
  }

  /**
   * Check if item is dirty
   */
  isDirty(id: string): boolean {
    return this.dirtyItems.has(id);
  }

  /**
   * Get all dirty items
   */
  getDirtyItems(): Map<string, T> {
    return new Map(this.dirtyItems);
  }

  /**
   * Get dirty item by ID
   */
  getDirtyItem(id: string): T | undefined {
    return this.dirtyItems.get(id);
  }

  /**
   * Check if there are any dirty items
   */
  hasDirtyItems(): boolean {
    return this.dirtyItems.size > 0;
  }

  /**
   * Clear all dirty items
   */
  clear(): void {
    this.dirtyItems.clear();
  }

  /**
   * Get count of dirty items
   */
  getDirtyCount(): number {
    return this.dirtyItems.size;
  }
}


