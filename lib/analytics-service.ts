'use client';

import { OrderService } from './order-service';
import { MenuService } from './menu-service';
import { FeedbackService } from './feedback-service';
import { AnalyticsData, DailySalesPoint, MonthlySalesPoint, PopularDish, PeakHourPoint } from './types';

export const AnalyticsService = {
  async getRestaurantAnalytics(restaurantId: string): Promise<AnalyticsData> {
    if (!restaurantId) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        averageRating: 0.0,
        totalReviews: 0,
        revenueGrowthRate: 0,
        dailySales: [],
        monthlySales: [],
        popularDishes: [],
        peakHours: [],
      };
    }

    const [orders, menuItems, feedbackStats] = await Promise.all([
      OrderService.getRestaurantOrders(restaurantId),
      MenuService.getMenuItems(restaurantId),
      FeedbackService.getFeedbackStats(restaurantId),
    ]);

    const completedOrActiveOrders = (orders || []).filter((o) => o.status !== 'cancelled');
    const totalOrders = completedOrActiveOrders.length;
    const totalRevenue = completedOrActiveOrders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 1. Build 7-Day Daily Sales from actual orders
    const daysMap = new Map<string, { label: string; revenue: number; orders: number }>();
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      daysMap.set(dateKey, { label: dayName, revenue: 0, orders: 0 });
    }

    completedOrActiveOrders.forEach((o) => {
      const orderDate = o.created_at.split('T')[0];
      if (daysMap.has(orderDate)) {
        const current = daysMap.get(orderDate)!;
        current.revenue += Number(o.total_amount || 0);
        current.orders += 1;
      }
    });

    const dailySales: DailySalesPoint[] = [];
    daysMap.forEach((val, dateKey) => {
      dailySales.push({
        date: dateKey,
        label: val.label,
        revenue: parseFloat(val.revenue.toFixed(2)),
        orders: val.orders,
      });
    });

    // 2. Build 6-Month Monthly Sales from actual orders
    const monthlySales: MonthlySalesPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });

      const monthOrders = completedOrActiveOrders.filter((o) => {
        const oDate = new Date(o.created_at);
        return oDate.getFullYear() === d.getFullYear() && oDate.getMonth() === d.getMonth();
      });

      const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      monthlySales.push({
        month: monthKey,
        label: monthLabel,
        revenue: parseFloat(monthRevenue.toFixed(2)),
        orders: monthOrders.length,
      });
    }

    // 3. Compute Popular Dishes (strictly from real orders, no fake quantities)
    const dishSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();

    completedOrActiveOrders.forEach((ord) => {
      (ord.items || []).forEach((it) => {
        const key = it.name;
        const current = dishSalesMap.get(key) || {
          name: it.name,
          qty: 0,
          revenue: 0,
        };
        current.qty += it.quantity;
        current.revenue += Number(it.price) * it.quantity;
        dishSalesMap.set(key, current);
      });
    });

    const sumPopularRevenue = Array.from(dishSalesMap.values()).reduce((s, d) => s + d.revenue, 0) || 1;

    const popularDishes: PopularDish[] = Array.from(dishSalesMap.entries())
      .map(([name, data], i) => {
        const matchedItem = menuItems.find((m) => m.name.toLowerCase() === name.toLowerCase());
        return {
          id: `pop-${i}`,
          name: data.name,
          categoryName: matchedItem?.category_id || 'Specialty',
          image: matchedItem?.image || null,
          totalQuantity: data.qty,
          totalRevenue: parseFloat(data.revenue.toFixed(2)),
          percentageOfSales: parseFloat(((data.revenue / sumPopularRevenue) * 100).toFixed(1)),
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 6);

    // 4. Peak Dining Hours from actual orders
    const slotCounts = {
      lunch: 0,
      afternoon: 0,
      earlyDinner: 0,
      rush: 0,
      late: 0,
    };

    completedOrActiveOrders.forEach((o) => {
      const hour = new Date(o.created_at).getHours();
      if (hour >= 11 && hour < 13) slotCounts.lunch++;
      else if (hour >= 13 && hour < 17) slotCounts.afternoon++;
      else if (hour >= 17 && hour < 19) slotCounts.earlyDinner++;
      else if (hour >= 19 && hour < 21) slotCounts.rush++;
      else if (hour >= 21) slotCounts.late++;
    });

    const peakHours: PeakHourPoint[] = [
      { hour: '11:00', label: '11 AM - 1 PM (Lunch)', orders: slotCounts.lunch },
      { hour: '13:00', label: '1 PM - 5 PM (Afternoon)', orders: slotCounts.afternoon },
      { hour: '17:00', label: '5 PM - 7 PM (Early Dinner)', orders: slotCounts.earlyDinner },
      { hour: '19:00', label: '7 PM - 9 PM (Dinner Rush)', orders: slotCounts.rush },
      { hour: '21:00', label: '9 PM - 11 PM (Late Night)', orders: slotCounts.late },
    ];

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      averageRating: feedbackStats.averageRating || 0,
      totalReviews: feedbackStats.totalReviews || 0,
      revenueGrowthRate: 0,
      dailySales,
      monthlySales,
      popularDishes,
      peakHours,
    };
  },
};
