/**
 * 登录失败锁定机制
 * 防止暴力破解
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 分钟

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

/**
 * 检查登录尝试
 */
export async function checkLoginAttempt(
  kv: KVNamespace,
  identifier: string
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: number }> {
  const data = await kv.get(`login:${identifier}`);
  const attempt = data ? JSON.parse(data as string) : { count: 0, lastAttempt: 0, lockedUntil: 0 };
  
  const now = Date.now();
  
  // 检查是否锁定
  if (attempt.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }
  
  // 检查尝试次数
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_TIME;
    attempt.count = 0;
    await kv.put(`login:${identifier}`, JSON.stringify(attempt), {
      expirationTtl: Math.ceil(LOCKOUT_TIME / 1000),
    });
    
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }
  
  // 检查是否在窗口期内
  const windowStart = now - (60 * 1000); // 1 分钟窗口
  if (attempt.lastAttempt > windowStart) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - attempt.count,
    };
  }
  
  // 超过窗口期，重置计数
  attempt.count = 0;
  attempt.lastAttempt = 0;
  
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS,
  };
}

/**
 * 记录登录失败
 */
export async function recordLoginFailure(
  kv: KVNamespace,
  identifier: string
): Promise<{ count: number; remainingAttempts: number; lockedUntil?: number }> {
  const data = await kv.get(`login:${identifier}`);
  const attempt = data ? JSON.parse(data as string) : { count: 0, lastAttempt: 0, lockedUntil: 0 };
  
  const now = Date.now();
  const windowStart = now - (60 * 1000);
  
  // 如果超过窗口期，重置计数
  if (attempt.lastAttempt <= windowStart) {
    attempt.count = 0;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  
  // 检查是否需要锁定
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_TIME;
  }
  
  await kv.put(`login:${identifier}`, JSON.stringify(attempt), {
    expirationTtl: Math.ceil(((attempt.lockedUntil || now) - now) / 1000) + 60,
  });
  
  return {
    count: attempt.count,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempt.count),
    lockedUntil: attempt.lockedUntil,
  };
}

/**
 * 记录登录成功
 */
export async function recordLoginSuccess(
  kv: KVNamespace,
  identifier: string
): Promise<void> {
  await kv.delete(`login:${identifier}`);
}
