/**
 * 生产环境安全的日志工具
 * 在 Cloudflare Workers 环境中，从 c.env.ENVIRONMENT 获取环境信息
 */

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  environment?: string;
}

class Logger {
  private environment: string;

  constructor(config: LoggerConfig = {}) {
    this.environment = config.environment || 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // 在生产环境中，只记录错误和警告
    if (this.environment === 'production') {
      return level === 'error' || level === 'warn';
    }
    // 开发环境记录所有日志
    return true;
  }

  log(...args: any[]) {
    if (this.shouldLog('log')) {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(...args);
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(...args);
    }
  }

  error(...args: any[]) {
    // 始终记录错误
    console.error(...args);
  }

  debug(...args: any[]) {
    if (this.environment !== 'production') {
      console.debug(...args);
    }
  }
}

// 导出默认实例（使用开发环境配置）
export const logger = new Logger();

// 导出工厂函数用于创建自定义配置的 logger
export const createLogger = (config: LoggerConfig) => new Logger(config);
