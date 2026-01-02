// User and Profile Types
export type UserRole = 'driver' | 'passenger' | 'admin';

export interface Profile {
  id: string;
  telegram_id: string;
  role: UserRole;
  phone: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

// Order Types
export type OrderType = 'passenger' | 'parcel';
export type OrderStatus = 'pending' | 'matched' | 'completed' | 'cancelled';

export interface OrderDetails {
  seat_count?: number; // For passenger orders
  parcel_size?: string; // For parcel orders (e.g., "small", "medium", "large")
  parcel_weight?: number; // For parcel orders in kg
  description?: string;
}

export interface Order {
  id: string;
  user_id: string;
  type: OrderType;
  from_city: string;
  to_city: string;
  scheduled_at: string;
  status: OrderStatus;
  details: OrderDetails;
  price: number | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  user?: Profile;
}

// Form Types
export interface OrderFormData {
  from_city: string;
  to_city: string;
  date: string;
  time: string;
  type: OrderType;
  count: number;
  offer_price?: number;
  phone: string;
  description?: string;
}

// Filter Types
export interface OrderFilters {
  from_city?: string;
  to_city?: string;
  type?: OrderType;
  status?: OrderStatus;
}

// Bundle Types for Smart Stacking
export interface OrderBundle {
  id: string; // Composite key: `${to_city}_${timeWindow}`
  to_city: string;
  scheduled_at: string; // Representative time (earliest in the window)
  orders: Order[];
  totalPrice: number;
  passengerCount: number;
  parcelCount: number;
}

// Telegram WebApp Types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

