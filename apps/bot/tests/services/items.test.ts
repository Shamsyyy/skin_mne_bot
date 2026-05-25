import { describe, it, expect, beforeEach } from 'vitest';
import {
  createItem,
  listItems,
  searchItems,
  updateItemStatus,
  moveInboxToType,
  clearMemoryStore,
} from '../../src/services/items.js';

const USER = '00000000-0000-4000-8000-000000000001';

describe('items service (memory)', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('creates and lists purchase', async () => {
    await createItem(USER, { type: 'purchase', content: 'Лампочки' });
    const items = await listItems(USER, 'purchase');
    expect(items).toHaveLength(1);
    expect(items[0].content).toBe('Лампочки');
  });

  it('moves inbox to category', async () => {
    const item = await createItem(USER, { type: 'inbox', content: 'test' });
    await moveInboxToType(USER, item.id, 'task');
    const tasks = await listItems(USER, 'task');
    expect(tasks[0].type).toBe('task');
  });

  it('marks done', async () => {
    const item = await createItem(USER, { type: 'task', content: 'x' });
    await updateItemStatus(USER, item.id, 'done');
    const active = await listItems(USER, 'task');
    expect(active).toHaveLength(0);
  });

  it('searches content', async () => {
    await createItem(USER, { type: 'note', content: 'HDMI переходник' });
    const found = await searchItems(USER, 'hdmi');
    expect(found.length).toBeGreaterThan(0);
  });

  it('soft deletes', async () => {
    const item = await createItem(USER, { type: 'note', content: 'del' });
    await updateItemStatus(USER, item.id, 'deleted');
    const found = await searchItems(USER, 'del');
    expect(found).toHaveLength(0);
  });
});
