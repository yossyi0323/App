import { describe, it, expect, beforeEach } from 'vitest';
import { DirtyTracker } from '../dirty-tracker';

describe('DirtyTracker', () => {
  let tracker: DirtyTracker<{ value: number }>;

  beforeEach(() => {
    tracker = new DirtyTracker();
  });

  it('should mark item as dirty', () => {
    tracker.markDirty('item1', { value: 10 });
    
    expect(tracker.isDirty('item1')).toBe(true);
    expect(tracker.hasDirtyItems()).toBe(true);
    expect(tracker.getDirtyCount()).toBe(1);
  });

  it('should get dirty item by ID', () => {
    const data = { value: 10 };
    tracker.markDirty('item1', data);
    
    expect(tracker.getDirtyItem('item1')).toEqual(data);
  });

  it('should mark item as saved and remove from dirty list', () => {
    tracker.markDirty('item1', { value: 10 });
    tracker.markSaved('item1', { value: 10 });
    
    expect(tracker.isDirty('item1')).toBe(false);
    expect(tracker.hasDirtyItems()).toBe(false);
  });

  it('should track multiple dirty items', () => {
    tracker.markDirty('item1', { value: 10 });
    tracker.markDirty('item2', { value: 20 });
    tracker.markDirty('item3', { value: 30 });
    
    expect(tracker.getDirtyCount()).toBe(3);
    
    const dirtyItems = tracker.getDirtyItems();
    expect(dirtyItems.size).toBe(3);
    expect(dirtyItems.get('item1')).toEqual({ value: 10 });
  });

  it('should update dirty item data', () => {
    tracker.markDirty('item1', { value: 10 });
    tracker.markDirty('item1', { value: 20 }); // Update
    
    expect(tracker.getDirtyItem('item1')).toEqual({ value: 20 });
    expect(tracker.getDirtyCount()).toBe(1); // Still only 1 item
  });

  it('should clear all dirty items', () => {
    tracker.markDirty('item1', { value: 10 });
    tracker.markDirty('item2', { value: 20 });
    
    tracker.clear();
    
    expect(tracker.hasDirtyItems()).toBe(false);
    expect(tracker.getDirtyCount()).toBe(0);
  });
});


