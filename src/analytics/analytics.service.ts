import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsCardDto } from './dto/analytics.dto';
import { subDays, format, startOfDay, endOfDay, startOfHour, differenceInDays } from 'date-fns';
import { TopProductsDto } from './dto/analytics-top-products.dto';
import { TopProductsMetricsDto } from './dto/analytics-top-products-metrics.dto';
import { DailyCategoryPerformanceDto } from './dto/analytics-category-performance-query';
import { PaymentMethodBreakdownDto } from './dto/payment-method-analytics.dto';
import { RealtimeDashboardDto } from './dto/realtime-dashboard.dto';
import { HourlySalesDto } from './dto/hourly-sales.dto';
import { TransactionMetricsDto } from './dto/transaction-metrics.dto';
import { EmployeePerformanceDto } from './dto/employee-performance.dto';
import { InventoryAnalyticsDto, LowStockProductDto } from './dto/inventory-analytics.dto';
import { LotAnalyticsDto } from './dto/lot-analytics.dto';
import { WeeklyPatternDto } from './dto/weekly-pattern.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // private calculateGrowth(current: number, previous: number): number {
  //   if (previous === 0) return 100;
  //   return ((current - previous) / previous) * 100;
  // }

  async getAnalyticsCards(period: number): Promise<AnalyticsCardDto[]> {
    const now = new Date();
    const startCurrent = subDays(now, period);
    const startPrevious = subDays(now, period * 2);
    const endPrevious = startCurrent;

    // --- Total Orders ---
    const totalOrdersCurrent = await this.prisma.order.count({
      where: { createdAt: { gte: startCurrent } },
    });
    const totalOrdersPrevious = await this.prisma.order.count({
      where: { createdAt: { gte: startPrevious, lt: endPrevious } },
    });

    // --- Total Revenue ---
    const revenueCurrent = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: startCurrent }, status: { not: 'CANCELLED' } },
    });
    const revenuePrevious = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startPrevious, lt: endPrevious },
        status: { not: 'CANCELLED' },
      },
    });

    // --- Active Users ---
    const activeUsersCurrent = await this.prisma.user.count({
      where: { lastLoginAt: { gte: startCurrent }, isActive: true },
    });
    const activeUsersPrevious = await this.prisma.user.count({
      where: {
        lastLoginAt: { gte: startPrevious, lt: endPrevious },
        isActive: true,
      },
    });

    // --- Products Sold ---
    const productsSoldCurrent = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: startCurrent },
          status: { not: 'CANCELLED' },
        },
      },
    });
    const productsSoldPrevious = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: startPrevious, lt: endPrevious },
          status: { not: 'CANCELLED' },
        },
      },
    });

    return [
      {
        title: 'Total Orders',
        count: totalOrdersCurrent,
        growth: this.calculateGrowth(totalOrdersCurrent, totalOrdersPrevious),
        description: `Orders placed in the last ${period} days`,
      },
      {
        title: 'Revenue',
        count: revenueCurrent._sum.totalAmount?.toNumber() || 0,
        growth: this.calculateGrowth(
          revenueCurrent._sum.totalAmount?.toNumber() || 0,
          revenuePrevious._sum.totalAmount?.toNumber() || 0,
        ),
        description: `Revenue generated in the last ${period} days`,
      },
      {
        title: 'Active Users',
        count: activeUsersCurrent,
        growth: this.calculateGrowth(activeUsersCurrent, activeUsersPrevious),
        description: `Users who logged in within the last ${period} days`,
      },
      {
        title: 'Products Sold',
        count: productsSoldCurrent._sum.quantity || 0,
        growth: this.calculateGrowth(
          productsSoldCurrent._sum.quantity || 0,
          productsSoldPrevious._sum.quantity || 0,
        ),
        description: `Total products sold in the last ${period} days`,
      },
    ];
  }

  async getChartData(period: number) {
    const startDate = subDays(new Date(), period);

    // Fetch all delivered & completed orders within the period
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED',
      },
      include: {
        items: true, // include order items to calculate products sold
      },
      orderBy: { createdAt: 'asc' },
    });

    // Initialize data object for all dates
    const data: Record<string, any> = {};
    for (let i = 0; i <= period; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      data[date] = { date, orders: 0, revenue: 0, products: 0 };
    }

    // Aggregate orders, revenue, and products per day
    orders.forEach((order) => {
      if (!order?.createdAt) return; // skip if createdAt is missing

      const date = format(order.createdAt, 'yyyy-MM-dd');

      // Ensure the date entry exists
      if (!data[date]) {
        data[date] = { date, orders: 0, revenue: 0, products: 0 };
      }

      data[date].orders += 1;
      data[date].revenue += Number(order.totalAmount ?? 0);
      data[date].products +=
        order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
    });

    // Return a sorted array by date ascending
    return Object.values(data).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  async getTopProducts(period: number): Promise<TopProductsDto[]> {
    const results = await this.prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: {
            gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000),
          },
        },
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    return results.map((r) => ({
      productName: r.productName,
      totalOrdered: r._sum.quantity ?? 0, // <- coerce null to 0
    }));
  }

  async getTopProductsMetrics(
    period: number,
  ): Promise<TopProductsMetricsDto[]> {
    const fromDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: fromDate },
          status: { not: 'CANCELLED' },
        },
      },
      select: {
        productName: true,
        quantity: true,
        totalPrice: true,
      },
    });

    const metricsMap: Record<
      string,
      { totalOrdered: number; totalRevenue: number }
    > = {};

    for (const item of orderItems) {
      if (!metricsMap[item.productName]) {
        metricsMap[item.productName] = { totalOrdered: 0, totalRevenue: 0 };
      }
      metricsMap[item.productName].totalOrdered += item.quantity;
      metricsMap[item.productName].totalRevenue += Number(item.totalPrice);
    }

    const result: TopProductsMetricsDto[] = Object.entries(metricsMap)
      .map(([label, values]) => ({
        label,
        totalOrdered: values.totalOrdered,
        totalRevenue: values.totalRevenue,
      }))
      .sort((a, b) => b.totalOrdered - a.totalOrdered)
      .slice(0, 10); // top 10

    return result;
  }

  async getCategoryPerformance(
    period: number,
  ): Promise<DailyCategoryPerformanceDto[]> {
    const startDate = subDays(new Date(), period);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        sku: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    categories: true,
                  },
                },
              },
            },
          },
        },
        order: {
          select: {
            createdAt: true,
            totalAmount: true,
            id: true,
          },
        },
      },
    });

    const data: Record<string, any> = {};
    for (let i = 0; i <= period; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      data[date] = { date };
    }

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: { name: true },
    });

    categories.forEach((category) => {
      const categoryKey = category.name.toLowerCase().replace(/\s+/g, '');
      for (const dateKey in data) {
        data[dateKey][categoryKey] = {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
        };
      }
    });

    const dailyOrders: Record<string, Set<string>> = {};

    orderItems.forEach((item) => {
      const date = format(item.order.createdAt, 'yyyy-MM-dd');
      const orderId = item.order.id;

      if (!dailyOrders[date]) {
        dailyOrders[date] = new Set();
      }

      if (data[date] && item.sku?.variant?.product?.categories?.length > 0) {
        const category = item.sku.variant.product.categories[0];
        const categoryKey = category.name.toLowerCase().replace(/\s+/g, '');

        if (data[date][categoryKey] !== undefined) {
          data[date][categoryKey].totalProducts += item.quantity;
          data[date][categoryKey].totalRevenue += Number(item.totalPrice);

          if (!dailyOrders[date].has(`${categoryKey}-${orderId}`)) {
            data[date][categoryKey].totalOrders += 1;
            dailyOrders[date].add(`${categoryKey}-${orderId}`);
          }
        }
      }
    });

    const finalData = Object.values(data);

    finalData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return finalData as DailyCategoryPerformanceDto[];
  }

  calculateGrowth(current: number, previous: number) {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }
}
