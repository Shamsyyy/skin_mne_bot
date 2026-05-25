import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard, type DashboardData } from '../api/client';

export function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <h1>Скинь мне</h1>
      <p style={{ color: 'var(--hint)', marginBottom: 16 }}>
        Твой личный органайзер
      </p>

      {error && (
        <p className="card">Подключи API (Supabase Edge Function) для live-данных.</p>
      )}

      {data && (
        <>
          <div className="card">
            📥 Входящие: <strong>{data.inboxCount}</strong>
          </div>
          <h2>Дела на сегодня</h2>
          {data.todayTasks.length === 0 ? (
            <p className="empty">Нет задач</p>
          ) : (
            data.todayTasks.map((t) => (
              <div key={t.id} className="card">
                {t.content}
              </div>
            ))
          )}
          <h2>Ближайшие напоминания</h2>
          {data.upcomingReminders.map((r) => (
            <div key={r.id} className="card">
              ⏰ {r.title}
            </div>
          ))}
        </>
      )}

      <Link to="/tasks" className="btn">Записать / Дела</Link>
      <Link to="/purchases" className="btn btn-secondary">Покупки</Link>
      <Link to="/reminders" className="btn btn-secondary">Напоминания</Link>
      <Link to="/search" className="btn btn-secondary">Найти</Link>
    </div>
  );
}
