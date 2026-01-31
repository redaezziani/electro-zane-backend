import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsCardDto } from './dto/analytics.dto';
import { subDays, format, startOfDay, endOfDay, startOfHour, differenceInDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
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
import { DailyCashSummaryDto } from './dto/daily-cash-summary.dto';
import { LowStockAlertDto } from './dto/low-stock-alerts.dto';
import { ProfitSummaryDto, DailyProfitDto } from './dto/profit-tracking.dto';
import { BestSellingProductDto } from './dto/best-selling-products.dto';
import { HourlyPatternSummaryDto, HourlyPatternDto } from './dto/hourly-pattern.dto';
import { StockValueSummaryDto, StockValueByCategoryDto, StockValueByProductDto } from './dto/stock-value.dto';
import { WeeklyTrendsSummaryDto, WeeklyTrendDataDto } from './dto/weekly-trends.dto';

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

  // ==================== NEW ANALYTICS METHODS ====================

  /**
   * Daily Cash Summary - Most important!
   * Shows today's cash flow, orders, and payment status
   */
  async getDailyCashSummary(period: number = 1): Promise<DailyCashSummaryDto> {
    const startDate = startOfDay(subDays(new Date(), period - 1));
    const endDate = endOfDay(new Date());

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        payments: true,
        items: true,
      },
    });

    const completedPayments = orders
      .flatMap(o => o.payments)
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayments = orders
      .flatMap(o => o.payments)
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalCash = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const itemsSold = orders.flatMap(o => o.items).reduce((sum, item) => sum + item.quantity, 0);

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      totalCash,
      ordersCount: orders.length,
      averageOrderValue: orders.length > 0 ? totalCash / orders.length : 0,
      completedPayments,
      pendingPayments,
      itemsSold,
    };
  }

  /**
   * Low Stock Alerts - Avoid running out
   * Shows products that are running low on inventory
   */
  async getLowStockAlerts(threshold?: number): Promise<LowStockAlertDto[]> {
    const skus = await this.prisma.productSKU.findMany({
      where: {
        isActive: true,
        OR: threshold !== undefined
          ? [{ stock: { lte: threshold } }]
          : [{ stock: { lte: this.prisma.productSKU.fields.lowStockAlert } }],
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    return skus.map(sku => {
      const alertLevel = sku.lowStockAlert;
      const alertSeverity = alertLevel > 0
        ? Math.round(((alertLevel - sku.stock) / alertLevel) * 100)
        : 100;

      return {
        skuId: sku.id,
        sku: sku.sku,
        productName: sku.variant.product.name,
        variantName: sku.variant.name,
        currentStock: sku.stock,
        lowStockAlert: sku.lowStockAlert,
        price: Number(sku.price),
        coverImage: sku.coverImage,
        alertSeverity: Math.max(0, Math.min(100, alertSeverity)),
      };
    });
  }

  /**
   * Profit Tracking - Know if you're making money
   * Calculates daily profit based on revenue and estimated costs
   */
  async getProfitTracking(period: number = 30): Promise<ProfitSummaryDto> {
    const startDate = subDays(new Date(), period);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: {
          include: {
            sku: true,
          },
        },
      },
    });

    // Group by date
    const dailyData: Record<string, { revenue: number; cost: number; orders: number }> = {};

    for (let i = 0; i <= period; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyData[date] = { revenue: 0, cost: 0, orders: 0 };
    }

    orders.forEach(order => {
      const date = format(order.createdAt, 'yyyy-MM-dd');
      if (!dailyData[date]) return;

      dailyData[date].revenue += Number(order.totalAmount);
      dailyData[date].orders += 1;

      // Calculate actual cost using initPrice from SKU
      const actualCost = order.items.reduce((sum, item) => {
        const costPrice = item.sku?.initPrice ? Number(item.sku.initPrice) : Number(item.unitPrice) * 0.65;
        return sum + (costPrice * item.quantity);
      }, 0);
      dailyData[date].cost += actualCost;
    });

    const dailyBreakdown: DailyProfitDto[] = Object.entries(dailyData)
      .map(([date, data]) => {
        const grossProfit = data.revenue - data.cost;
        const profitMargin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;

        return {
          date,
          revenue: data.revenue,
          costOfGoods: data.cost,
          grossProfit,
          profitMargin,
          ordersCount: data.orders,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalRevenue = dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0);
    const totalCost = dailyBreakdown.reduce((sum, d) => sum + d.costOfGoods, 0);
    const totalProfit = totalRevenue - totalCost;
    const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const bestDay = dailyBreakdown.reduce((max, day) =>
      day.grossProfit > max.grossProfit ? day : max, dailyBreakdown[0]);

    const worstDay = dailyBreakdown.reduce((min, day) =>
      day.grossProfit < min.grossProfit ? day : min, dailyBreakdown[0]);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      averageProfitMargin,
      dailyBreakdown,
      bestDay,
      worstDay,
    };
  }

  /**
   * Best-selling products - Know what to reorder
   * Shows top products by sales volume with reorder insights
   */
  async getBestSellingProducts(period: number = 30, limit: number = 10): Promise<BestSellingProductDto[]> {
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
                    variants: {
                      include: {
                        skus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by product
    const productMap: Record<string, {
      productId: string;
      productName: string;
      unitsSold: number;
      revenue: number;
      orders: Set<string>;
      totalStock: number;
      coverImage: string | null;
      prices: number[];
    }> = {};

    orderItems.forEach(item => {
      const product = item.sku.variant.product;
      if (!productMap[product.id]) {
        const totalStock = product.variants
          .flatMap(v => v.skus)
          .reduce((sum, sku) => sum + sku.stock, 0);

        productMap[product.id] = {
          productId: product.id,
          productName: product.name,
          unitsSold: 0,
          revenue: 0,
          orders: new Set(),
          totalStock,
          coverImage: product.coverImage,
          prices: [],
        };
      }

      productMap[product.id].unitsSold += item.quantity;
      productMap[product.id].revenue += Number(item.totalPrice);
      productMap[product.id].orders.add(item.orderId);
      productMap[product.id].prices.push(Number(item.unitPrice));
    });

    const results: BestSellingProductDto[] = Object.values(productMap)
      .map(p => {
        const averagePrice = p.prices.length > 0
          ? p.prices.reduce((a, b) => a + b, 0) / p.prices.length
          : 0;

        const dailySalesRate = p.unitsSold / period;
        const daysUntilStockout = dailySalesRate > 0 && p.totalStock > 0
          ? p.totalStock / dailySalesRate
          : null;

        let stockStatus = 'OK';
        if (p.totalStock === 0) stockStatus = 'OUT_OF_STOCK';
        else if (daysUntilStockout !== null && daysUntilStockout < 7) stockStatus = 'LOW';

        return {
          productId: p.productId,
          productName: p.productName,
          unitsSold: p.unitsSold,
          totalRevenue: p.revenue,
          ordersCount: p.orders.size,
          averagePrice,
          currentStock: p.totalStock,
          coverImage: p.coverImage,
          stockStatus,
          daysUntilStockout,
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);

    return results;
  }

  /**
   * Hourly Pattern - Know your busy times
   * Shows sales patterns by hour of day
   */
  async getHourlyPattern(period: number = 30): Promise<HourlyPatternSummaryDto> {
    const startDate = subDays(new Date(), period);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
    });

    // Group by hour
    const hourlyData: Record<number, { orders: number; revenue: number; items: number }> = {};
    for (let h = 0; h < 24; h++) {
      hourlyData[h] = { orders: 0, revenue: 0, items: 0 };
    }

    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += Number(order.totalAmount);
      hourlyData[hour].items += order.items.reduce((sum, i) => sum + i.quantity, 0);
    });

    const hourlyPattern: HourlyPatternDto[] = Object.entries(hourlyData).map(([hourStr, data]) => {
      const hour = parseInt(hourStr);
      const hourLabel = format(new Date().setHours(hour, 0, 0, 0), 'h:00 a');

      return {
        hour,
        hourLabel,
        averageOrders: data.orders / period,
        totalOrders: data.orders,
        averageRevenue: data.revenue / period,
        totalRevenue: data.revenue,
        averageItemsSold: data.items / period,
        isPeakHour: false, // Will calculate below
      };
    });

    // Determine peak hours (top 25%)
    const sortedByOrders = [...hourlyPattern].sort((a, b) => b.totalOrders - a.totalOrders);
    const peakThreshold = Math.ceil(24 * 0.25);
    const peakHourNumbers = new Set(sortedByOrders.slice(0, peakThreshold).map(h => h.hour));

    hourlyPattern.forEach(h => {
      h.isPeakHour = peakHourNumbers.has(h.hour);
    });

    const busiestHour = sortedByOrders[0];
    const slowestHour = sortedByOrders[sortedByOrders.length - 1];
    const peakHours = hourlyPattern.filter(h => h.isPeakHour);

    return {
      hourlyData: hourlyPattern,
      busiestHour,
      slowestHour,
      peakHours,
      daysAnalyzed: period,
    };
  }

  /**
   * Stock Value - How much money is on your shelf
   * Calculates total inventory value by product and category
   */
  async getStockValue(): Promise<StockValueSummaryDto> {
    const skus = await this.prisma.productSKU.findMany({
      where: { isActive: true },
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
    });

    // Calculate totals
    const totalStockValue = skus.reduce((sum, sku) => sum + (sku.stock * Number(sku.price)), 0);
    const totalUnits = skus.reduce((sum, sku) => sum + sku.stock, 0);
    const uniqueProducts = new Set(skus.map(s => s.variant.productId)).size;
    const uniqueSkus = skus.length;
    const averageValuePerSku = uniqueSkus > 0 ? totalStockValue / uniqueSkus : 0;

    const lowStockValue = skus
      .filter(sku => sku.stock <= sku.lowStockAlert)
      .reduce((sum, sku) => sum + (sku.stock * Number(sku.price)), 0);

    const outOfStockValue = 0; // Out of stock items have 0 value

    // Group by category
    const categoryMap: Record<string, {
      categoryId: string;
      categoryName: string;
      totalStock: number;
      stockValue: number;
      productsCount: Set<string>;
    }> = {};

    skus.forEach(sku => {
      const categories = sku.variant.product.categories;
      if (categories.length === 0) return;

      const category = categories[0]; // Use first category
      if (!categoryMap[category.id]) {
        categoryMap[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          totalStock: 0,
          stockValue: 0,
          productsCount: new Set(),
        };
      }

      categoryMap[category.id].totalStock += sku.stock;
      categoryMap[category.id].stockValue += sku.stock * Number(sku.price);
      categoryMap[category.id].productsCount.add(sku.variant.productId);
    });

    const byCategory: StockValueByCategoryDto[] = Object.values(categoryMap)
      .map(c => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        totalStock: c.totalStock,
        stockValue: c.stockValue,
        productsCount: c.productsCount.size,
        percentageOfTotal: totalStockValue > 0 ? (c.stockValue / totalStockValue) * 100 : 0,
      }))
      .sort((a, b) => b.stockValue - a.stockValue);

    // Group by product for top products
    const productMap: Record<string, {
      productId: string;
      productName: string;
      totalStock: number;
      prices: number[];
      variantsCount: number;
      coverImage: string | null;
    }> = {};

    skus.forEach(sku => {
      const product = sku.variant.product;
      if (!productMap[product.id]) {
        productMap[product.id] = {
          productId: product.id,
          productName: product.name,
          totalStock: 0,
          prices: [],
          variantsCount: 0,
          coverImage: product.coverImage,
        };
      }

      productMap[product.id].totalStock += sku.stock;
      productMap[product.id].prices.push(Number(sku.price));
      productMap[product.id].variantsCount += 1;
    });

    const topProducts: StockValueByProductDto[] = Object.values(productMap)
      .map(p => {
        const averagePrice = p.prices.length > 0
          ? p.prices.reduce((a, b) => a + b, 0) / p.prices.length
          : 0;
        const stockValue = p.totalStock * averagePrice;

        return {
          productId: p.productId,
          productName: p.productName,
          totalStock: p.totalStock,
          averagePrice,
          stockValue,
          variantsCount: p.variantsCount,
          coverImage: p.coverImage,
        };
      })
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 10);

    return {
      totalStockValue,
      totalUnits,
      uniqueProducts,
      uniqueSkus,
      averageValuePerSku,
      lowStockValue,
      outOfStockValue,
      byCategory,
      topProducts,
    };
  }

  /**
   * Weekly Trends - Is business growing?
   * Shows week-over-week performance trends
   */
  async getWeeklyTrends(weeks: number = 12): Promise<WeeklyTrendsSummaryDto> {
    const weeklyData: WeeklyTrendDataDto[] = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 }); // Sunday

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: weekStart, lte: weekEnd },
          status: { not: 'CANCELLED' },
        },
        include: {
          items: true,
        },
      });

      const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const itemsSold = orders.flatMap(o => o.items).reduce((sum, item) => sum + item.quantity, 0);
      const uniqueCustomers = new Set(orders.map(o => o.customerPhone)).size;
      const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0;

      // Calculate growth compared to previous week
      const previousWeekData = weeklyData[weeklyData.length - 1];
      const revenueGrowth = previousWeekData
        ? this.calculateGrowth(revenue, previousWeekData.revenue)
        : 0;
      const ordersGrowth = previousWeekData
        ? this.calculateGrowth(orders.length, previousWeekData.ordersCount)
        : 0;

      weeklyData.push({
        weekNumber: weeks - i,
        weekLabel: `${format(weekStart, 'MMM dd')}-${format(weekEnd, 'dd')}`,
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        ordersCount: orders.length,
        revenue,
        itemsSold,
        averageOrderValue,
        uniqueCustomers,
        revenueGrowth,
        ordersGrowth,
      });
    }

    weeklyData.reverse(); // Oldest to newest

    const averageWeeklyRevenue = weeklyData.reduce((sum, w) => sum + w.revenue, 0) / weeks;
    const averageWeeklyOrders = weeklyData.reduce((sum, w) => sum + w.ordersCount, 0) / weeks;

    const bestWeek = weeklyData.reduce((max, w) => w.revenue > max.revenue ? w : max, weeklyData[0]);
    const worstWeek = weeklyData.reduce((min, w) => w.revenue < min.revenue ? w : min, weeklyData[0]);

    // Calculate overall trend
    const firstWeekRevenue = weeklyData[0]?.revenue || 0;
    const lastWeekRevenue = weeklyData[weeklyData.length - 1]?.revenue || 0;
    const overallGrowthRate = this.calculateGrowth(lastWeekRevenue, firstWeekRevenue);

    let trendDirection = 'STABLE';
    if (overallGrowthRate > 5) trendDirection = 'GROWING';
    else if (overallGrowthRate < -5) trendDirection = 'DECLINING';

    return {
      weeklyData,
      averageWeeklyRevenue,
      averageWeeklyOrders,
      bestWeek,
      worstWeek,
      trendDirection,
      overallGrowthRate,
      weeksAnalyzed: weeks,
    };
  }
}
