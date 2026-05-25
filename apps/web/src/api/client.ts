const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData ?? '';

  const res = await fetch(`${API_BASE}/functions/v1/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) throw new Error('API error');
  return res.json() as Promise<T>;
}

export interface DashboardData {
  inboxCount: number;
  todayTasks: { id: string; content: string }[];
  upcomingReminders: { id: string; title: string; remind_at: string }[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>('/dashboard');
}

export async function fetchItems(type: string): Promise<{ id: string; content: string; url?: string }[]> {
  return apiFetch(`/items?type=${type}`);
}

export async function searchItems(q: string): Promise<{ id: string; content: string; type: string }[]> {
  return apiFetch(`/search?q=${encodeURIComponent(q)}`);
}
