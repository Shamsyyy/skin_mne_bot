import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api/client';

export function RemindersPage() {
  const [reminders, setReminders] = useState<{ id: string; title: string; remind_at: string }[]>([]);

  useEffect(() => {
    fetchDashboard()
      .then((d) => setReminders(d.upcomingReminders))
      .catch(() => setReminders([]));
  }, []);

  return (
    <div>
      <h1>Напоминания</h1>
      {reminders.map((r) => (
        <div key={r.id} className="card">
          ⏰ {r.title}
          <div style={{ fontSize: 12, color: 'var(--hint)', marginTop: 4 }}>
            {new Date(r.remind_at).toLocaleString('ru-RU')}
          </div>
        </div>
      ))}
      {reminders.length === 0 && <p className="empty">Нет напоминаний</p>}
    </div>
  );
}
