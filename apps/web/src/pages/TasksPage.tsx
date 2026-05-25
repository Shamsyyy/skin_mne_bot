import { useEffect, useState } from 'react';
import { fetchItems } from '../api/client';

export function TasksPage() {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    fetchItems('task').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1>Дела</h1>
      {items.map((i) => (
        <div key={i.id} className="card">
          ⬜ {i.content}
        </div>
      ))}
      {items.length === 0 && <p className="empty">Нет активных дел</p>}
    </div>
  );
}
