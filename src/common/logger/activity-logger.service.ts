import { Injectable } from '@nestjs/common';
import { winstonLogger } from './winston.config';

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  RESTORE = 'RESTORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export interface ActivityLogData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action: ActivityAction;
  entity: string; // e.g., 'Order', 'Product', 'User', 'SKU'
  entityId?: string;
  description: string;
  metadata?: Record<string, any>; // Any additional data
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityLoggerService {
  /**
   * Log a business activity (user actions like create, update, delete)
   */
  logActivity(data: ActivityLogData): void {
    const logEntry = {
      level: 'info',
      message: data.description,
      timestamp: new Date().toISOString(),
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: data.userRole,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    winstonLogger.info(logEntry);
  }

  /**
   * Log an error
   */
  logError(error: Error, context?: string, metadata?: Record<string, any>): void {
    winstonLogger.error({
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log general info
   */
  logInfo(message: string, context?: string, metadata?: Record<string, any>): void {
    winstonLogger.info({
      message,
      context,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: string, metadata?: Record<string, any>): void {
    winstonLogger.warn({
      message,
      context,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log debug info
   */
  logDebug(message: string, context?: string, metadata?: Record<string, any>): void {
    winstonLogger.debug({
      message,
      context,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}
