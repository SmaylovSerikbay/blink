'use client';

import { useState, useEffect } from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { OrderFeed } from '@/components/OrderFeed';
import { OrderForm } from '@/components/OrderForm';
import { Navigation } from '@/components/Navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Page = 'feed' | 'create' | 'my-orders' | 'profile';

export default function Home() {
  const { webApp, isReady } = useTelegram();
  const { profile, fetchProfile, isLoading } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    if (isReady && webApp) {
      const telegramId = webApp.initDataUnsafe.user?.id?.toString() || '123456789';
      fetchProfile(telegramId).then(() => {
        // Check if profile exists and has a role
        if (!profile) {
          setShowRoleSwitcher(true);
        }
      });
    }
  }, [isReady, webApp, fetchProfile, profile]);

  useEffect(() => {
    if (profile && !profile.role) {
      setShowRoleSwitcher(true);
    } else if (profile && profile.role) {
      setShowRoleSwitcher(false);
    }
  }, [profile]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showRoleSwitcher && webApp) {
    const telegramId = webApp.initDataUnsafe.user?.id?.toString() || '123456789';
    return (
      <RoleSwitcher
        telegramId={telegramId}
        onRoleSelected={() => setShowRoleSwitcher(false)}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':
        return <OrderFeed />;
      case 'create':
        return (
          <OrderForm
            onSuccess={() => {
              setCurrentPage('feed');
              // Show success message
            }}
          />
        );
      case 'my-orders':
        return (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Мои заявки (в разработке)
            </CardContent>
          </Card>
        );
      case 'profile':
        if (profile?.role === 'admin') {
          return <AdminDashboard />;
        }
        return (
          <Card>
            <CardContent className="py-8 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Профиль</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Роль:</span>{' '}
                    {profile?.role === 'driver' ? 'Водитель' : profile?.role === 'passenger' ? 'Пассажир' : 'Администратор'}
                  </div>
                  {profile?.full_name && (
                    <div>
                      <span className="text-muted-foreground">Имя:</span> {profile.full_name}
                    </div>
                  )}
                  {profile?.phone && (
                    <div>
                      <span className="text-muted-foreground">Телефон:</span> {profile.phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <OrderFeed />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-20 px-4 py-6">
        {renderPage()}
      </main>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}
