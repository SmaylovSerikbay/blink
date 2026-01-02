'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Truck, Shield } from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase/client';

interface RoleSwitcherProps {
  telegramId: string;
  onRoleSelected: () => void;
}

export function RoleSwitcher({ telegramId, onRoleSelected }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setProfile } = useAuthStore();

  const roles: Array<{ value: UserRole; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'passenger',
      label: 'Пассажир',
      icon: <User className="h-8 w-8" />,
      description: 'Создавайте заявки на поездку или отправку посылок',
    },
    {
      value: 'driver',
      label: 'Водитель',
      icon: <Truck className="h-8 w-8" />,
      description: 'Просматривайте и принимайте заявки',
    },
    {
      value: 'admin',
      label: 'Администратор',
      icon: <Shield className="h-8 w-8" />,
      description: 'Управление заявками и системой',
    },
  ];

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('telegram_id', telegramId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data as any);
          onRoleSelected();
        }
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramId,
            role,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data as any);
          onRoleSelected();
        }
      }
    } catch (error) {
      console.error('Error setting role:', error);
      alert('Ошибка при сохранении роли. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Добро пожаловать в Blink</CardTitle>
          <CardDescription>Выберите вашу роль для продолжения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.map((role) => (
            <Button
              key={role.value}
              variant={selectedRole === role.value ? 'default' : 'outline'}
              className="w-full h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handleRoleSelect(role.value)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3 w-full">
                {role.icon}
                <div className="flex-1 text-left">
                  <div className="font-semibold">{role.label}</div>
                  <div className="text-xs opacity-80">{role.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

