'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderStore } from '@/store/useOrderStore';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { User, Package, Loader2 } from 'lucide-react';
import type { Order } from '@/types';

export function AdminDashboard() {
  const { orders, isLoading, fetchOrders, subscribeToOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToOrders();
    return unsubscribe;
  }, [fetchOrders, subscribeToOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const matchedOrders = orders.filter((o) => o.status === 'matched');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ожидают</CardDescription>
            <CardTitle className="text-2xl">{pendingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Приняты</CardDescription>
            <CardTitle className="text-2xl">{matchedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Завершены</CardDescription>
            <CardTitle className="text-2xl">{completedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все заявки</CardTitle>
          <CardDescription>Управление всеми заявками в системе</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет заявок
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    matched: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  const statusLabels = {
    pending: 'Ожидает',
    matched: 'Принята',
    completed: 'Завершена',
    cancelled: 'Отменена',
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {order.type === 'passenger' ? (
            <User className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          <span className="font-medium">
            {order.type === 'passenger' ? 'Пассажир' : 'Посылка'}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>
      <div className="text-sm space-y-1">
        <div>
          <strong>{order.from_city}</strong> → <strong>{order.to_city}</strong>
        </div>
        <div className="text-muted-foreground">
          {formatDateTime(order.scheduled_at)}
        </div>
        <div className="text-muted-foreground">
          Пользователь: {order.user?.full_name || order.user?.telegram_id || 'Неизвестно'}
        </div>
        {order.price && (
          <div className="font-medium">{formatPrice(order.price)}</div>
        )}
      </div>
    </div>
  );
}

