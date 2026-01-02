import type { Order, OrderBundle } from '@/types';

const ONE_HOUR_MS = 60 * 60 * 1000; // 1 час в миллисекундах

/**
 * Группирует заказы по to_city и scheduled_at (в пределах 1 часа)
 * Возвращает массив Bundle и массив отдельных заказов, которые не попали в группы
 */
export function groupOrders(orders: Order[]): {
  bundles: OrderBundle[];
  standaloneOrders: Order[];
} {
  // Фильтруем только pending заказы
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  if (pendingOrders.length === 0) {
    return { bundles: [], standaloneOrders: [] };
  }

  // Группируем по to_city
  const byCity = new Map<string, Order[]>();
  for (const order of pendingOrders) {
    const city = order.to_city;
    if (!byCity.has(city)) {
      byCity.set(city, []);
    }
    byCity.get(city)!.push(order);
  }

  const bundles: OrderBundle[] = [];
  const standaloneOrders: Order[] = [];

  // Для каждого города группируем по временным окнам
  for (const [city, cityOrders] of byCity.entries()) {
    // Сортируем по времени
    const sorted = [...cityOrders].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    // Группируем по временным окнам (1 час)
    const timeGroups: Order[][] = [];
    let currentGroup: Order[] = [];
    let groupStartTime: number | null = null;

    for (const order of sorted) {
      const orderTime = new Date(order.scheduled_at).getTime();

      if (groupStartTime === null || orderTime - groupStartTime <= ONE_HOUR_MS) {
        // Добавляем в текущую группу
        if (currentGroup.length === 0) {
          groupStartTime = orderTime;
        }
        currentGroup.push(order);
      } else {
        // Начинаем новую группу
        if (currentGroup.length > 1) {
          timeGroups.push(currentGroup);
        } else {
          standaloneOrders.push(currentGroup[0]);
        }
        currentGroup = [order];
        groupStartTime = orderTime;
      }
    }

    // Обрабатываем последнюю группу
    if (currentGroup.length > 1) {
      timeGroups.push(currentGroup);
    } else if (currentGroup.length === 1) {
      standaloneOrders.push(currentGroup[0]);
    }

    // Создаем Bundle из групп
    for (const group of timeGroups) {
      const totalPrice = group.reduce((sum, order) => sum + (order.price || 0), 0);
      const passengerCount = group.filter((o) => o.type === 'passenger').length;
      const parcelCount = group.filter((o) => o.type === 'parcel').length;

      // Используем самое раннее время как representative
      const earliestTime = group.reduce(
        (earliest, order) => {
          const orderTime = new Date(order.scheduled_at).getTime();
          return orderTime < earliest ? orderTime : earliest;
        },
        new Date(group[0].scheduled_at).getTime()
      );

      bundles.push({
        id: `${city}_${earliestTime}`,
        to_city: city,
        scheduled_at: new Date(earliestTime).toISOString(),
        orders: group,
        totalPrice,
        passengerCount,
        parcelCount,
      });
    }
  }

  return { bundles, standaloneOrders };
}

