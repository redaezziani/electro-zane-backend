import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsQueryDto, AnalyticsCardDto } from './dto/analytics.dto';
import { AnalyticsChartDataDto } from './dto/analytics-chart-response.dto';
import { AnalyticsChartQueryDto } from './dto/analytics-chart.dto';
import { TopProductsDto } from './dto/analytics-top-products.dto';
import { AnalyticsTopProductsQueryDto } from './dto/analytics-top-products-query.dto';
import { TopProductsMetricsDto } from './dto/analytics-top-products-metrics.dto';
import { AnalyticsTopProductsMetricsQueryDto } from './dto/analytics-top-products-metrics-query.dto';
import { AnalyticsCategoryPerformanceQueryDto, DailyCategoryPerformanceDto } from './dto/analytics-category-performance-query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { DailyCashSummaryDto, DailyCashSummaryQueryDto } from './dto/daily-cash-summary.dto';
import { LowStockAlertDto, LowStockAlertsQueryDto } from './dto/low-stock-alerts.dto';
import { ProfitSummaryDto, ProfitTrackingQueryDto } from './dto/profit-tracking.dto';
import { BestSellingProductDto, BestSellingProductsQueryDto } from './dto/best-selling-products.dto';
import { HourlyPatternSummaryDto, HourlyPatternQueryDto } from './dto/hourly-pattern.dto';
import { StockValueSummaryDto } from './dto/stock-value.dto';
import { WeeklyTrendsSummaryDto, WeeklyTrendsQueryDto } from './dto/weekly-trends.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('cards')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get key analytics cards' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Period in days, default 30',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics cards retrieved successfully',
    type: [AnalyticsCardDto],
  })
  async getCards(
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsCardDto[]> {
    return this.analyticsService.getAnalyticsCards(query.period || 30);
  }

  @Get('chart')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({
    summary: 'Get daily chart data for orders, revenue, and products',
  })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    type: [AnalyticsChartDataDto],
  })
  async getChart(
    @Query() query: AnalyticsChartQueryDto,
  ): Promise<AnalyticsChartDataDto[]> {
    return this.analyticsService.getChartData(query.period || 30);
  }

  // New endpoint for top 10 products
  @Get('top-products')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get top 10 ordered products for a period' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Period in days, default 30',
  })
  @ApiResponse({
    status: 200,
    description: 'Top products retrieved successfully',
    type: [TopProductsDto],
  })
  async getTopProducts(
    @Query('period') query?: AnalyticsTopProductsQueryDto,
  ): Promise<TopProductsDto[]> {
    return this.analyticsService.getTopProducts(query?.period || 30);
  }

  @Get('top-products-metrics')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get top products metrics for charting' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Period in days (default 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top products metrics retrieved successfully',
    type: [TopProductsMetricsDto],
  })
  async getTopProductsMetrics(
    @Query() query: AnalyticsTopProductsMetricsQueryDto,
  ): Promise<TopProductsMetricsDto[]> {
    const period = query.period || 30;
    return this.analyticsService.getTopProductsMetrics(period);
  }

  @Get('category-performance')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get category performance metrics for charting' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Period in days (default 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Category performance metrics retrieved successfully',
    type: [DailyCategoryPerformanceDto], // <-- This is the fix
  })
  async getCategoryPerformance(
    @Query() query: AnalyticsCategoryPerformanceQueryDto,
  ): Promise<DailyCategoryPerformanceDto[]> {
    // <-- This is the fix
    const period = query.period || 30;
    return this.analyticsService.getCategoryPerformance(period);
  }

  // ==================== NEW ANALYTICS ENDPOINTS ====================

  @Get('daily-cash-summary')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get daily cash summary - Most important!' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Number of days to look back (default: 1 for today)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily cash summary retrieved successfully',
    type: DailyCashSummaryDto,
  })
  async getDailyCashSummary(
    @Query() query: DailyCashSummaryQueryDto,
  ): Promise<DailyCashSummaryDto> {
    return this.analyticsService.getDailyCashSummary(query.period || 1);
  }

  @Get('low-stock-alerts')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get low stock alerts - Avoid running out' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Minimum stock threshold (default: from SKU lowStockAlert)',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock alerts retrieved successfully',
    type: [LowStockAlertDto],
  })
  async getLowStockAlerts(
    @Query() query: LowStockAlertsQueryDto,
  ): Promise<LowStockAlertDto[]> {
    return this.analyticsService.getLowStockAlerts(query.threshold);
  }

  @Get('profit-tracking')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get profit tracking - Know if you\'re making money' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Number of days to analyze (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profit tracking retrieved successfully',
    type: ProfitSummaryDto,
  })
  async getProfitTracking(
    @Query() query: ProfitTrackingQueryDto,
  ): Promise<ProfitSummaryDto> {
    return this.analyticsService.getProfitTracking(query.period || 30);
  }

  @Get('best-selling-products')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get best-selling products - Know what to reorder' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Number of days to analyze (default: 30)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top products to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Best-selling products retrieved successfully',
    type: [BestSellingProductDto],
  })
  async getBestSellingProducts(
    @Query() query: BestSellingProductsQueryDto,
  ): Promise<BestSellingProductDto[]> {
    return this.analyticsService.getBestSellingProducts(
      query.period || 30,
      query.limit || 10,
    );
  }

  @Get('hourly-pattern')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get hourly pattern - Know your busy times' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Number of days to analyze (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Hourly pattern retrieved successfully',
    type: HourlyPatternSummaryDto,
  })
  async getHourlyPattern(
    @Query() query: HourlyPatternQueryDto,
  ): Promise<HourlyPatternSummaryDto> {
    return this.analyticsService.getHourlyPattern(query.period || 30);
  }

  @Get('stock-value')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get stock value - How much money is on your shelf' })
  @ApiResponse({
    status: 200,
    description: 'Stock value retrieved successfully',
    type: StockValueSummaryDto,
  })
  async getStockValue(): Promise<StockValueSummaryDto> {
    return this.analyticsService.getStockValue();
  }

  @Get('weekly-trends')
  @Permissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get weekly trends - Is business growing?' })
  @ApiQuery({
    name: 'weeks',
    required: false,
    description: 'Number of weeks to analyze (default: 12)',
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly trends retrieved successfully',
    type: WeeklyTrendsSummaryDto,
  })
  async getWeeklyTrends(
    @Query() query: WeeklyTrendsQueryDto,
  ): Promise<WeeklyTrendsSummaryDto> {
    return this.analyticsService.getWeeklyTrends(query.weeks || 12);
  }
}
