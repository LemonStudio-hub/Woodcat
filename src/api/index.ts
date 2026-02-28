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

type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// 中间件
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://woodcat.pages.dev'],
  credentials: true,
}));
app.use('*', logger());

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

// 错误处理
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message 
  }, 500);
});

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;