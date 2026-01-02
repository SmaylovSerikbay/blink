'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import type { OrderFormData, OrderType } from '@/types';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const orderFormSchema = z.object({
  from_city: z.string().min(1, 'Укажите город отправления'),
  to_city: z.string().min(1, 'Укажите город назначения'),
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().min(1, 'Укажите время'),
  type: z.enum(['passenger', 'parcel']),
  count: z.number().min(1, 'Укажите количество'),
  offer_price: z.number().optional(),
  phone: z.string().min(1, 'Укажите номер телефона'),
  description: z.string().optional(),
});

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

export function OrderForm({ onSuccess }: { onSuccess?: () => void }) {
  const { profile } = useAuthStore();
  const { createOrder } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      type: 'passenger',
      phone: profile?.phone || '',
    },
  });

  const orderType = watch('type');

  const onSubmit = async (data: OrderFormData) => {
    if (!profile) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const scheduledAt = new Date(`${data.date}T${data.time}`);
      
      const orderDetails: any = {};
      if (data.type === 'passenger') {
        orderDetails.seat_count = data.count;
      } else {
        orderDetails.parcel_size = 'medium'; // Can be enhanced
        orderDetails.parcel_weight = data.count;
      }
      if (data.description) {
        orderDetails.description = data.description;
      }

      const orderData = {
        user_id: profile.id,
        type: data.type as OrderType,
        from_city: data.from_city,
        to_city: data.to_city,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending' as const,
        details: orderDetails,
        price: data.offer_price || null,
      };

      const newOrder = await createOrder(orderData);
      if (newOrder) {
        // Update profile phone if provided
        if (data.phone && data.phone !== profile.phone) {
          await useAuthStore.getState().updateProfile({ phone: data.phone });
        }
        onSuccess?.();
      } else {
        alert('Ошибка при создании заявки. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при создании заявки. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Создать заявку</CardTitle>
        <CardDescription>Заполните форму для создания новой заявки</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_city">Откуда</Label>
              <Select onValueChange={(value) => setValue('from_city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.from_city && (
                <p className="text-sm text-destructive">{errors.from_city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_city">Куда</Label>
              <Select onValueChange={(value) => setValue('to_city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_city && (
                <p className="text-sm text-destructive">{errors.to_city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input id="time" type="time" {...register('time')} />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип заявки</Label>
            <Select
              defaultValue="passenger"
              onValueChange={(value) => setValue('type', value as OrderType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passenger">Пассажир</SelectItem>
                <SelectItem value="parcel">Посылка</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">
              {orderType === 'passenger' ? 'Количество мест' : 'Вес (кг)'}
            </Label>
            <Input
              id="count"
              type="number"
              min="1"
              {...register('count', { valueAsNumber: true })}
            />
            {errors.count && (
              <p className="text-sm text-destructive">{errors.count.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (___) ___-__-__"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer_price">Предложенная цена (тенге, опционально)</Label>
            <Input
              id="offer_price"
              type="number"
              min="0"
              placeholder="Оставьте пустым для договорной"
              {...register('offer_price', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Input
              id="description"
              placeholder="Дополнительная информация"
              {...register('description')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              'Создать заявку'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

