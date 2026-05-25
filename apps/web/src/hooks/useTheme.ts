import { useEffect } from 'react';

export function useTelegramTheme(): void {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    if (tg?.themeParams) {
      const p = tg.themeParams;
      const root = document.documentElement;
      if (p.bg_color) root.style.setProperty('--tg-theme-bg-color', p.bg_color);
      if (p.text_color) root.style.setProperty('--tg-theme-text-color', p.text_color);
      if (p.hint_color) root.style.setProperty('--tg-theme-hint-color', p.hint_color);
      if (p.button_color) root.style.setProperty('--tg-theme-button-color', p.button_color);
      if (p.button_text_color) root.style.setProperty('--tg-theme-button-text-color', p.button_text_color);
      if (p.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color);
    }
  }, []);
}
