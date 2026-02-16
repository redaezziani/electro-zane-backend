import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { BarcodeModule } from './barcode/barcode.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { SettingsModule } from './settings/settings.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogsModule } from './logs/logs.module';
import { LotsModule } from './lots/lots.module';
import { LotArrivalsModule } from './lot-arrivals/lot-arrivals.module';
import { LotPiecesModule } from './lot-pieces/lot-pieces.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ShipmentPiecesModule } from './shipment-pieces/shipment-pieces.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CommonModule,
    UsersModule,
    OrdersModule,
    BarcodeModule,
    OrderItemsModule,
    AnalyticsModule,
    PaymentsModule,
    SettingsModule,
    EventEmitterModule.forRoot(),
    LogsModule,
    LotsModule,
    LotArrivalsModule,
    LotPiecesModule,
    ShipmentsModule,
    ShipmentPiecesModule,
  ],
  controllers: [],
  providers: [],
})
export class BaseModule {}
