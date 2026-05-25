import { useState } from 'react';
import { searchItems } from '../api/client';

export function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; content: string; type: string }[]>([]);

  const search = async () => {
    if (!q.trim()) return;
    try {
      setResults(await searchItems(q));
    } catch {
      setResults([]);
    }
  };

  return (
    <div>
      <h1>Поиск</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Что ищем?"
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: 'none',
          background: 'var(--secondary)',
          color: 'var(--text)',
          marginBottom: 12,
          fontSize: 16,
        }}
      />
      <button type="button" className="btn" onClick={search}>
        Найти
      </button>
      {results.map((r) => (
        <div key={r.id} className="card">
          {r.content}
        </div>
      ))}
    </div>
  );
}
