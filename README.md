# Blink - MVP Telegram Mini App

Междугородний сервис такси и логистики в формате Telegram Mini App.

## Технологии

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/UI**
- **Supabase** (PostgreSQL, Auth, Realtime)
- **Zustand** (State Management)
- **React Hook Form** + **Zod** (Forms & Validation)
- **Lucide React** (Icons)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Выполните миграцию из `supabase/migrations/001_initial_schema.sql` в SQL Editor
3. Скопируйте `.env.local.example` в `.env.local`
4. Заполните переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL вашего проекта Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key из настроек проекта

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 4. Тестирование в Telegram

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Настройте Web App через команду `/newapp`
3. Укажите URL вашего приложения (для разработки можно использовать ngrok)

## Структура проекта

```
my-taxi-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Главная страница
│   │   └── globals.css   # Глобальные стили
│   ├── components/        # React компоненты
│   │   ├── ui/           # UI компоненты (Shadcn)
│   │   ├── RoleSwitcher.tsx
│   │   ├── OrderForm.tsx
│   │   ├── OrderFeed.tsx
│   │   └── Navigation.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useTelegram.ts
│   ├── lib/              # Утилиты и конфигурация
│   │   ├── supabase/     # Supabase клиент
│   │   └── utils.ts
│   ├── store/            # Zustand stores
│   │   ├── useAuthStore.ts
│   │   └── useOrderStore.ts
│   └── types/            # TypeScript типы
│       └── index.ts
├── supabase/
│   └── migrations/       # SQL миграции
│       └── 001_initial_schema.sql
└── package.json
```

## Основные функции

### Для пассажиров:
- Создание заявок на поездку или доставку посылок
- Просмотр статуса своих заявок

### Для водителей:
- Просмотр ленты активных заявок
- Фильтрация по маршруту и типу (пассажир/посылка)
- Принятие заявок
- Связь через WhatsApp

### Для администраторов:
- Просмотр всех заявок (в разработке)

## База данных

### Таблицы:

- **profiles** - Профили пользователей
  - `id` (UUID)
  - `telegram_id` (TEXT, UNIQUE)
  - `role` (ENUM: driver, passenger, admin)
  - `phone` (TEXT)
  - `full_name` (TEXT)

- **orders** - Заявки
  - `id` (UUID)
  - `user_id` (FK → profiles)
  - `type` (ENUM: passenger, parcel)
  - `from_city` (TEXT)
  - `to_city` (TEXT)
  - `scheduled_at` (TIMESTAMP)
  - `status` (ENUM: pending, matched, completed, cancelled)
  - `details` (JSONB)
  - `price` (NUMERIC)

## Развертывание

### Vercel

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Деплой автоматически запустится

### Настройка Telegram Web App

После деплоя:
1. Обновите URL Web App в BotFather
2. Протестируйте в Telegram

## Разработка

### Локальная разработка

Приложение автоматически использует мок Telegram WebApp API для локальной разработки. Все функции работают без реального Telegram бота.

### Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Лицензия

MIT
