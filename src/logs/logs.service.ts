import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { QueryLogsDto, LogType } from './dto/query-logs.dto';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  context?: string;
  stack?: string;
}

interface PaginatedLogsResponse {
  data: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class LogsService {
  private readonly logsDir = path.resolve(process.cwd(), 'logs');

  /**
   * Get logs with pagination and filtering
   */
  async getLogs(query: QueryLogsDto): Promise<PaginatedLogsResponse> {
    const { page = 1, limit = 50, type = LogType.ACTIVITY, date, search, userId, action, entity, entityId } = query;

    // Determine log file name
    const dateStr = date || this.getCurrentDate();
    const fileName = this.getLogFileName(type, dateStr);
    const filePath = path.join(this.logsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
    }

    // Read and parse log file
    const logs = await this.readLogFile(filePath);

    // Filter logs
    let filteredLogs = logs;

    if (search) {
      filteredLogs = filteredLogs.filter(log =>
        log.message?.toLowerCase().includes(search.toLowerCase()) ||
        log.userName?.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    if (entity) {
      filteredLogs = filteredLogs.filter(log => log.entity === entity);
    }

    if (entityId) {
      filteredLogs = filteredLogs.filter(log => log.entityId === entityId);
    }

    // Sort by timestamp descending (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(skip, skip + limit);

    return {
      data: paginatedLogs,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get available log dates
   */
  async getAvailableDates(type: LogType = LogType.ACTIVITY): Promise<string[]> {
    if (!fs.existsSync(this.logsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.logsDir);
    const prefix = type === LogType.ACTIVITY ? 'activity-' : type === LogType.ERROR ? 'error-' : 'combined-';

    const dates = files
      .filter(file => file.startsWith(prefix) && file.endsWith('.log'))
      .map(file => {
        const match = file.match(/\d{4}-\d{2}-\d{2}/);
        return match ? match[0] : null;
      })
      .filter(date => date !== null)
      .sort()
      .reverse();

    return [...new Set(dates)];
  }

  /**
   * Get log statistics
   */
  async getLogStats(date?: string): Promise<any> {
    const dateStr = date || this.getCurrentDate();
    const stats = {
      date: dateStr,
      totalLogs: 0,
      activityLogs: 0,
      errorLogs: 0,
      actionBreakdown: {} as Record<string, number>,
      entityBreakdown: {} as Record<string, number>,
      userBreakdown: {} as Record<string, number>,
    };

    // Read activity logs
    const activityFile = this.getLogFileName(LogType.ACTIVITY, dateStr);
    const activityPath = path.join(this.logsDir, activityFile);

    if (fs.existsSync(activityPath)) {
      const logs = await this.readLogFile(activityPath);
      stats.activityLogs = logs.length;
      stats.totalLogs += logs.length;

      logs.forEach(log => {
        if (log.action) {
          stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1;
        }
        if (log.entity) {
          stats.entityBreakdown[log.entity] = (stats.entityBreakdown[log.entity] || 0) + 1;
        }
        if (log.userName) {
          stats.userBreakdown[log.userName] = (stats.userBreakdown[log.userName] || 0) + 1;
        }
      });
    }

    // Read error logs
    const errorFile = this.getLogFileName(LogType.ERROR, dateStr);
    const errorPath = path.join(this.logsDir, errorFile);

    if (fs.existsSync(errorPath)) {
      const logs = await this.readLogFile(errorPath);
      stats.errorLogs = logs.length;
      stats.totalLogs += logs.length;
    }

    return stats;
  }

  /**
   * Read and parse log file
   */
  private async readLogFile(filePath: string): Promise<LogEntry[]> {
    const logs: LogEntry[] = [];

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        try {
          const logEntry = JSON.parse(line);
          logs.push(logEntry);
        } catch (error) {
          // Skip invalid JSON lines
          console.error('Failed to parse log line:', error);
        }
      }
    }

    return logs;
  }

  /**
   * Get log file name based on type and date
   */
  private getLogFileName(type: LogType, date: string): string {
    switch (type) {
      case LogType.ACTIVITY:
        return `activity-${date}.log`;
      case LogType.ERROR:
        return `error-${date}.log`;
      case LogType.COMBINED:
        return `combined-${date}.log`;
      default:
        return `activity-${date}.log`;
    }
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
