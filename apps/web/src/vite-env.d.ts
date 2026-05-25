/// <reference types="vite/client" />

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData: string;
  themeParams: Record<string, string>;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
