# Структура проекта Blink

## Обзор архитектуры

Проект построен на Next.js 14+ с использованием App Router, TypeScript, и современных практик разработки.

## Структура директорий

```
my-taxi-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout с Telegram WebApp интеграцией
│   │   ├── page.tsx           # Главная страница с роутингом
│   │   └── globals.css        # Глобальные стили (темная тема по умолчанию)
│   │
│   ├── components/            # React компоненты
│   │   ├── ui/               # Базовые UI компоненты (Shadcn/UI)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── tabs.tsx
│   │   ├── RoleSwitcher.tsx  # Компонент выбора роли при онбординге
│   │   ├── OrderForm.tsx     # Форма создания заявки
│   │   ├── OrderFeed.tsx     # Лента заявок для водителей
│   │   ├── Navigation.tsx    # Нижняя навигационная панель
│   │   └── AdminDashboard.tsx # Админ-панель
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useTelegram.ts    # Хук для работы с Telegram WebApp API
│   │
│   ├── lib/                   # Утилиты и конфигурация
│   │   ├── supabase/
│   │   │   ├── client.ts     # Supabase клиент
│   │   │   └── database.types.ts # TypeScript типы для БД
│   │   └── utils.ts          # Вспомогательные функции (cn, formatDate, etc.)
│   │
│   ├── store/                 # Zustand stores (State Management)
│   │   ├── useAuthStore.ts   # Управление аутентификацией и профилем
│   │   └── useOrderStore.ts  # Управление заявками
│   │
│   └── types/                 # TypeScript типы и интерфейсы
│       └── index.ts          # Все типы приложения
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # SQL миграция для создания схемы БД
│
├── public/                    # Статические файлы
├── package.json               # Зависимости проекта
├── tsconfig.json              # TypeScript конфигурация
├── next.config.ts             # Next.js конфигурация
└── README.md                  # Документация проекта
```

## Ключевые компоненты

### 1. App Router (`src/app/`)

- **layout.tsx**: Корневой layout с загрузкой Telegram WebApp скрипта
- **page.tsx**: Главная страница с условным рендерингом в зависимости от роли пользователя

### 2. Компоненты (`src/components/`)

#### UI компоненты
Базовые переиспользуемые компоненты на основе Radix UI и Tailwind CSS.

#### Бизнес-компоненты
- **RoleSwitcher**: Выбор роли при первом входе
- **OrderForm**: Форма создания заявки с валидацией (react-hook-form + zod)
- **OrderFeed**: Лента заявок с фильтрацией и realtime обновлениями
- **Navigation**: Мобильная нижняя навигация
- **AdminDashboard**: Панель администратора для управления заявками

### 3. Hooks (`src/hooks/`)

- **useTelegram**: 
  - Определяет, запущено ли приложение в Telegram
  - Предоставляет мок для локальной разработки
  - Инициализирует Telegram WebApp API

### 4. Stores (`src/store/`)

#### useAuthStore
- Управление профилем пользователя
- Загрузка и обновление профиля из Supabase
- Синхронизация с Telegram ID

#### useOrderStore
- Управление заявками (CRUD операции)
- Фильтрация заявок
- Realtime подписка на изменения через Supabase
- Различная логика для разных ролей (пассажир/водитель/админ)

### 5. Types (`src/types/`)

Централизованное определение всех TypeScript типов:
- `Profile`, `Order`, `OrderFormData`
- `UserRole`, `OrderType`, `OrderStatus`
- `TelegramWebApp` интерфейс

### 6. Database (`supabase/migrations/`)

SQL миграция создает:
- Enum типы для ролей, типов заявок, статусов
- Таблицы `profiles` и `orders`
- Индексы для оптимизации запросов
- Триггеры для автоматического обновления `updated_at`
- Row Level Security (RLS) политики

## Потоки данных

### Создание заявки
1. Пользователь заполняет `OrderForm`
2. Валидация через `zod`
3. `useOrderStore.createOrder()` отправляет данные в Supabase
4. Realtime подписка обновляет UI для всех пользователей

### Просмотр заявок
1. `OrderFeed` загружает заявки через `useOrderStore.fetchOrders()`
2. Применяются фильтры (город, тип, статус)
3. Realtime подписка автоматически обновляет список

### Принятие заявки водителем
1. Водитель нажимает "Принять заявку"
2. `useOrderStore.updateOrder()` обновляет статус на `matched`
3. Realtime обновление уведомляет всех пользователей

## Интеграции

### Telegram WebApp
- Автоматическое определение контекста (Telegram или браузер)
- Мок для локальной разработки
- Использование `initData` для аутентификации

### Supabase
- PostgreSQL для хранения данных
- Realtime подписки для синхронизации
- Row Level Security для безопасности

## Стилизация

- **Tailwind CSS 4** для утилитарных классов
- **Темная тема по умолчанию** (оптимизировано для Telegram)
- **Mobile-first** подход
- **Shadcn/UI** компоненты для консистентности

## Безопасность

- Row Level Security (RLS) в Supabase
- Валидация данных на клиенте (zod)
- Проверка ролей перед действиями
- Безопасное хранение Telegram ID

## Производительность

- Server Components где возможно
- Realtime подписки только при необходимости
- Индексы в БД для быстрых запросов
- Оптимизированные запросы с фильтрацией на стороне БД

