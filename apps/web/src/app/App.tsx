import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useTelegramTheme } from '../hooks/useTheme';
import { HomePage } from '../pages/HomePage';
import { InboxPage } from '../pages/InboxPage';
import { TasksPage } from '../pages/TasksPage';
import { PurchasesPage } from '../pages/PurchasesPage';
import { LinksPage } from '../pages/LinksPage';
import { RemindersPage } from '../pages/RemindersPage';
import { SearchPage } from '../pages/SearchPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav">
        <NavLink to="/" end>Главная</NavLink>
        <NavLink to="/inbox">Входящие</NavLink>
        <NavLink to="/tasks">Дела</NavLink>
        <NavLink to="/purchases">Покупки</NavLink>
        <NavLink to="/links">Ссылки</NavLink>
        <NavLink to="/reminders">Напоминания</NavLink>
        <NavLink to="/search">Поиск</NavLink>
      </nav>
      {children}
    </>
  );
}

export function App() {
  useTelegramTheme();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
