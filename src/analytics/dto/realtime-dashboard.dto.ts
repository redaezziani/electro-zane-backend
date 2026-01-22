import { ApiProperty } from '@nestjs/swagger';

export class RealtimeDashboardDto {
  @ApiProperty({ example: 45, description: 'Total orders today' })
  todayOrders: number;

  @ApiProperty({ example: 12500, description: 'Total revenue today' })
  todayRevenue: number;

  @ApiProperty({ example: 156, description: 'Total items sold today' })
  todayItemsSold: number;

  @ApiProperty({ example: 278, description: 'Average order value today' })
  todayAverageOrderValue: number;

  @ApiProperty({ example: 12, description: 'Orders in current hour' })
  currentHourOrders: number;

  @ApiProperty({ example: 3200, description: 'Revenue in current hour' })
  currentHourRevenue: number;

  @ApiProperty({ example: 3, description: 'Active/pending orders' })
  activeOrders: number;

  @ApiProperty({ example: 25000, description: 'Cash in register (today)' })
  cashInRegister: number;
}
