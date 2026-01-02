import { useEffect, useState } from 'react';
import type { TelegramWebApp } from '@/types';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're in Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsReady(true);
    } else {
      // Mock for local development
      const mockWebApp: TelegramWebApp = {
        initData: '',
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru',
          },
          auth_date: Date.now(),
          hash: '',
        },
        version: '6.0',
        platform: 'web',
        colorScheme: 'dark',
        themeParams: {
          bg_color: '#212121',
          text_color: '#ffffff',
          hint_color: '#999999',
          link_color: '#3390ec',
          button_color: '#3390ec',
          button_text_color: '#ffffff',
        },
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: '#212121',
        backgroundColor: '#212121',
        BackButton: {
          isVisible: false,
          onClick: () => {},
          offClick: () => {},
          show: () => {},
          hide: () => {},
        },
        MainButton: {
          text: '',
          color: '#3390ec',
          textColor: '#ffffff',
          isVisible: false,
          isActive: true,
          isProgressVisible: false,
          setText: () => {},
          onClick: () => {},
          offClick: () => {},
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          showProgress: () => {},
          hideProgress: () => {},
          setParams: () => {},
        },
        HapticFeedback: {
          impactOccurred: () => {},
          notificationOccurred: () => {},
          selectionChanged: () => {},
        },
        ready: () => {},
        expand: () => {},
        close: () => {},
      };
      setWebApp(mockWebApp);
      setIsReady(true);
    }
  }, []);

  return { webApp, isReady };
}

