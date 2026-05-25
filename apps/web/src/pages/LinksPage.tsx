import { useEffect, useState } from 'react';
import { fetchItems } from '../api/client';

export function LinksPage() {
  const [items, setItems] = useState<{ id: string; content: string; url?: string }[]>([]);

  useEffect(() => {
    fetchItems('link').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1>Ссылки</h1>
      {items.map((i) => (
        <div key={i.id} className="card">
          <div>{i.content}</div>
          {i.url && (
            <a href={i.url} target="_blank" rel="noreferrer">
              {i.url}
            </a>
          )}
        </div>
      ))}
      {items.length === 0 && <p className="empty">Нет ссылок</p>}
    </div>
  );
}
