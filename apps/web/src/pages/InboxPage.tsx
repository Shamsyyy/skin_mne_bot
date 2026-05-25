import { useEffect, useState } from 'react';
import { fetchItems } from '../api/client';

export function InboxPage() {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    fetchItems('inbox').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1>Входящие</h1>
      {items.length === 0 ? (
        <p className="empty">Пусто</p>
      ) : (
        items.map((i) => (
          <div key={i.id} className="card">
            {i.content}
          </div>
        ))
      )}
    </div>
  );
}
