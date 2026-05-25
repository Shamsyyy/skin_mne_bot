import { useEffect, useState } from 'react';
import { fetchItems } from '../api/client';

export function PurchasesPage() {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    fetchItems('purchase').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1>Покупки</h1>
      {items.map((i) => (
        <div key={i.id} className="card">
          🛒 {i.content}
        </div>
      ))}
      {items.length === 0 && <p className="empty">Список пуст</p>}
    </div>
  );
}
