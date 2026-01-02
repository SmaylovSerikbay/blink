'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrderStore } from '@/store/useOrderStore';
import type { Order, OrderType } from '@/types';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { User, Package, MapPin, Calendar, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const cities = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Атырау',
  'Туркестан',
];

export function OrderFeed() {
  const { orders, filters, isLoading, fetchOrders, setFilters, updateOrder, subscribeToOrders } = useOrderStore();
  const { profile } = useAuthStore();
  const [selectedType, setSelectedType] = useState<OrderType | 'all'>('all');

  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToOrders();
    return unsubscribe;
  }, [fetchOrders, subscribeToOrders]);

  const handleTakeOrder = async (order: Order) => {
    if (!profile || profile.role !== 'driver') {
      alert('Только водители могут принимать заявки');
      return;
    }

    if (confirm('Вы уверены, что хотите принять эту заявку?')) {
      await updateOrder(order.id, { status: 'matched' });
      alert('Заявка принята! Свяжитесь с пассажиром для уточнения деталей.');
    }
  };

  const handleContact = (phone: string | null) => {
    if (!phone) {
      alert('Номер телефона не указан');
      return;
    }
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedType !== 'all' && order.type !== selectedType) return false;
    if (filters.from_city && order.from_city !== filters.from_city) return false;
    if (filters.to_city && order.to_city !== filters.to_city) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as OrderType | 'all')}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
            <TabsTrigger value="passenger" className="flex-1">Пассажиры</TabsTrigger>
            <TabsTrigger value="parcel" className="flex-1">Посылки</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filters.from_city || ''}
            onValueChange={(value) => setFilters({ ...filters, from_city: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Откуда" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все города</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.to_city || ''}
            onValueChange={(value) => setFilters({ ...filters, to_city: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Куда" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все города</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Нет доступных заявок
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {order.type === 'passenger' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      {order.type === 'passenger' ? 'Пассажир' : 'Посылка'}
                    </CardTitle>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {formatPrice(order.price)}
                  </span>
                </div>
                <CardDescription>
                  {order.user?.full_name || 'Пользователь'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{order.from_city}</strong> → <strong>{order.to_city}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(order.scheduled_at)}</span>
                  </div>
                  {order.type === 'passenger' && order.details.seat_count && (
                    <div className="text-muted-foreground">
                      Мест: {order.details.seat_count}
                    </div>
                  )}
                  {order.type === 'parcel' && (
                    <div className="text-muted-foreground">
                      Вес: {order.details.parcel_weight || 'не указан'} кг
                    </div>
                  )}
                  {order.details.description && (
                    <div className="text-muted-foreground">
                      {order.details.description}
                    </div>
                  )}
                </div>

                {profile?.role === 'driver' && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleTakeOrder(order)}
                    >
                      Принять заявку
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleContact(order.user?.phone || null)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                )}

                {profile?.role === 'passenger' && order.user_id === profile.id && (
                  <div className="text-sm text-muted-foreground">
                    Статус: {order.status === 'pending' ? 'Ожидает' : order.status === 'matched' ? 'Принята' : order.status}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

