/**
 * 认证路由
 * 处理用户注册、登录、登出等
 */

import { Hono } from 'hono';
import { verifyTurnstile } from '../utils/turnstile';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';
import { getUserByEmail, getUserByUsername, createUser, createSession, recordLoginHistory } from '../utils/db';

type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
};

const authRoutes = new Hono<{ Bindings: Env }>();

/**
 * 注册
 */
authRoutes.post('/register', async (c) => {
  try {
    const { email, username, password, turnstileToken } = await c.req.json();

    // 验证 Turnstile
    const turnstileResult = await verifyTurnstile(c.env.TURNSTILE_SECRET_KEY, turnstileToken);
    if (!turnstileResult.success) {
      return c.json({ error: '验证失败，请重试' }, 400);
    }

    // 验证输入
    if (!email || !username || !password) {
      return c.json({ error: '请填写所有必填项' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: '密码至少需要 6 个字符' }, 400);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: '邮箱格式不正确' }, 400);
    }

    // 验证用户名
    if (username.length < 3 || username.length > 20) {
      return c.json({ error: '用户名长度需要在 3-20 个字符之间' }, 400);
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await getUserByEmail(c.env.DB, email);
    if (existingUserByEmail) {
      return c.json({ error: '该邮箱已被注册' }, 409);
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await getUserByUsername(c.env.DB, username);
    if (existingUserByUsername) {
      return c.json({ error: '该用户名已被使用' }, 409);
    }

    // 获取客户端信息
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    // 创建用户
    const passwordHash = await hashPassword(password);
    const user = await createUser(c.env.DB, {
      email,
      username,
      passwordHash,
      lastLoginIp: ip,
      lastLoginUserAgent: userAgent,
    });

    // 记录登录历史
    await recordLoginHistory(c.env.DB, user.id, ip, userAgent, 'success');

    // 生成 token
    const token = await generateToken({ userId: user.id, username: user.username }, c.env.JWT_SECRET);

    // 创建会话
    await createSession(c.env.DB, c.env.SESSIONS, {
      userId: user.id,
      token,
      ip,
      userAgent,
    });

    return c.json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: '注册失败，请稍后重试' }, 500);
  }
});

/**
 * 登录
 */
authRoutes.post('/login', async (c) => {
  try {
    const { email, password, turnstileToken } = await c.req.json();

    // 验证 Turnstile
    const turnstileResult = await verifyTurnstile(c.env.TURNSTILE_SECRET_KEY, turnstileToken);
    if (!turnstileResult.success) {
      return c.json({ error: '验证失败，请重试' }, 400);
    }

    // 验证输入
    if (!email || !password) {
      return c.json({ error: '请填写邮箱和密码' }, 400);
    }

    // 查找用户
    const user = await getUserByEmail(c.env.DB, email);
    if (!user) {
      // 记录失败的登录尝试
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      const userAgent = c.req.header('User-Agent') || 'unknown';
      // 注意：这里没有 user_id，需要处理
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // 记录失败的登录尝试
      const ip = c.req.header('CF-Connecting-IP') || 'unknown';
      const userAgent = c.req.header('User-Agent') || 'unknown';
      await recordLoginHistory(c.env.DB, user.id, ip, userAgent, 'failed');
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    // 获取客户端信息
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';

    // 更新最后登录信息
    await c.env.DB.prepare(`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP,
          last_login_ip = ?,
          last_login_user_agent = ?
      WHERE id = ?
    `).bind(ip, userAgent, user.id).run();

    // 记录登录历史
    await recordLoginHistory(c.env.DB, user.id, ip, userAgent, 'success');

    // 生成 token
    const token = await generateToken({ userId: user.id, username: user.username }, c.env.JWT_SECRET);

    // 创建会话
    await createSession(c.env.DB, c.env.SESSIONS, {
      userId: user.id,
      token,
      ip,
      userAgent,
    });

    return c.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: '登录失败，请稍后重试' }, 500);
  }
});

/**
 * 登出
 */
authRoutes.post('/logout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // 删除会话
      await c.env.DB.prepare(`
        DELETE FROM sessions WHERE token = ?
      `).bind(token).run();

      // 从 KV 中删除缓存
      await c.env.SESSIONS.delete(token);
    }

    return c.json({ success: true, message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: '登出失败' }, 500);
  }
});

/**
 * 验证 token
 */
authRoutes.get('/verify', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ valid: false }, 401);
    }

    // 检查会话是否存在
    const session = await c.env.DB.prepare(`
      SELECT s.*, u.id, u.email, u.username, u.avatar_url, u.bio
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
    `).bind(token).first();

    if (!session) {
      return c.json({ valid: false }, 401);
    }

    return c.json({
      valid: true,
      user: {
        id: session.id,
        email: session.email,
        username: session.username,
        avatarUrl: session.avatar_url,
        bio: session.bio,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ valid: false }, 500);
  }
});

export default authRoutes;