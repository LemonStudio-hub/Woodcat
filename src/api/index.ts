/**
 * Cloudflare Workers API 入口
 * 处理用户认证、注册、登录等请求
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { verifyCSRFToken, CSRF_HEADER_NAME } from './utils/csrf';

type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Env }>();

// 中间件
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://woodcat.pages.dev'],
  credentials: true,
}));
app.use('*', logger());

// CSRF 保护中间件（只对 POST/PUT/DELETE 请求生效）
app.use('/api/*', async (c, next) => {
  const method = c.req.method;
  
  // 只对状态改变的请求进行 CSRF 验证
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    const csrfToken = c.req.header(CSRF_HEADER_NAME);
    const cookieToken = getCookie(c, 'csrf_token');
    
    if (!csrfToken || !cookieToken) {
      console.error('CSRF token missing', { hasHeader: !!csrfToken, hasCookie: !!cookieToken });
      return c.json({ error: 'CSRF token 缺失' }, 403);
    }
    
    if (!verifyCSRFToken(csrfToken, cookieToken)) {
      console.error('CSRF token mismatch');
      return c.json({ error: 'CSRF token 无效' }, 403);
    }
  }
  
  await next();
});

// 健康检查
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 认证路由（不需要 JWT）
app.route('/api/auth', authRoutes);

// 用户路由（需要 JWT 验证）
app.use('/api/user/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: '未授权' }, 401);
  }

  try {
    const { verifyToken } = await import('./utils/crypto');
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    
    // 将 payload 存储到上下文中
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error) {
    return c.json({ error: '无效的 token' }, 401);
  }
});
app.route('/api/user', userRoutes);

// 获取客户端 IP 和 User-Agent
app.get('/api/client-info', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             'unknown';
  const userAgent = c.req.header('User-Agent') || 'unknown';
  
  return c.json({
    ip,
    userAgent,
    country: c.req.header('CF-IPCountry') || 'unknown',
  });
});

// 获取 CSRF token 端点
app.get('/api/csrf-token', async (c) => {
  const { generateCSRFToken } = await import('./utils/csrf');
  const token = generateCSRFToken();
  
  // 将 CSRF token 存储到 KV 中，有效期 1 小时
  await c.env.SESSIONS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  
  // 设置 cookie
  c.header('Set-Cookie', `csrf_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
  
  return c.json({ token });
});

/**
 * 从请求中获取 cookie
 */
function getCookie(c: any, name: string): string | null {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').map((cookie: string) => cookie.trim());
  const targetCookie = cookies.find((cookie: string) => cookie.startsWith(`${name}=`));
  
  if (!targetCookie) {
    return null;
  }
  
  return targetCookie.substring(name.length + 1);
}

// 错误处理
app.onError((err, c) => {
  console.error('API Error:', err);
  
  // 在生产环境中，不返回详细错误信息
  const isProduction = c.env.ENVIRONMENT === 'production';
  const message = isProduction 
    ? '服务器内部错误，请稍后重试' 
    : err.message || '未知错误';
  
  return c.json({ 
    error: 'Internal Server Error',
    message,
    timestamp: new Date().toISOString(),
  }, 500);
});

// 404 处理
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: '请求的资源不存在',
    timestamp: new Date().toISOString(),
  }, 404);
});

export default app;