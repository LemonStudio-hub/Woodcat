/**
 * 请求限流工具
 * 基于 KV 存储的限流实现
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * 检查并更新请求限流
 */
export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // 获取当前窗口的请求数
  const data = await kv.get(key);
  const requests = data ? JSON.parse(data as string) : { count: 0, resetAt: now + config.windowMs };
  
  // 如果窗口已过期，重置计数
  if (now > requests.resetAt) {
    requests.count = 0;
    requests.resetAt = now + config.windowMs;
  }
  
  // 检查是否超过限制
  if (requests.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: requests.resetAt,
    };
  }
  
  // 增加计数
  requests.count++;
  
  // 保存到 KV，设置过期时间为窗口结束时间
  await kv.put(key, JSON.stringify(requests), {
    expirationTtl: Math.ceil((requests.resetAt - now) / 1000),
  });
  
  return {
    success: true,
    remaining: config.maxRequests - requests.count,
    resetTime: requests.resetAt,
  };
}

/**
 * 生成限流键
 */
export function generateRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}
