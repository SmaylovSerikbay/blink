'use client';

import { Home, Plus, List, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile } = useAuthStore();

  const navItems = [
    { id: 'feed', label: 'Лента', icon: Home },
    { id: 'create', label: 'Создать', icon: Plus },
    { id: 'my-orders', label: 'Мои заявки', icon: List },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'flex flex-col h-full gap-1 rounded-none',
                isActive && 'text-primary'
              )}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

