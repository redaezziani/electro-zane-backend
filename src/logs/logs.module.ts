import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { ActivityLoggerService } from '../common/logger/activity-logger.service';

@Module({
  controllers: [LogsController],
  providers: [LogsService, ActivityLoggerService],
  exports: [ActivityLoggerService],
})
export class LogsModule {}
