/**
 * 用户路由
 * 处理用户资料编辑、信息获取等
 */

import { Hono } from 'hono';
import { updateUserProfile, getUserById } from '../utils/db';

interface JWTPayload {
  userId: number;
  username: string;
}

type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
};

const userRoutes = new Hono<{ Bindings: Env, Variables: { jwtPayload: JWTPayload } }>();

/**
 * 获取当前用户信息
 */
userRoutes.get('/profile', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (!payload) {
      return c.json({ error: '未授权' }, 401);
    }

    const user = await getUserById(c.env.DB, payload.userId);
    
    if (!user) {
      return c.json({ error: '用户不存在' }, 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: '获取用户信息失败' }, 500);
  }
});

/**
 * 更新用户资料
 */
userRoutes.put('/profile', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (!payload) {
      return c.json({ error: '未授权' }, 401);
    }

    const { username, bio, avatarUrl } = await c.req.json();

    // 验证用户名
    if (username && (username.length < 3 || username.length > 20)) {
      return c.json({ error: '用户名长度需要在 3-20 个字符之间' }, 400);
    }

    // 验证 bio
    if (bio && bio.length > 200) {
      return c.json({ error: '个人简介不能超过 200 个字符' }, 400);
    }

    // 更新用户资料
    const updatedUser = await updateUserProfile(c.env.DB, payload.userId, {
      username,
      bio,
      avatarUrl,
    });

    return c.json({
      success: true,
      message: '资料更新成功',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatar_url,
        bio: updatedUser.bio,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: '更新资料失败' }, 500);
  }
});

/**
 * 获取登录历史
 */
userRoutes.get('/login-history', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    if (!payload) {
      return c.json({ error: '未授权' }, 401);
    }

    const history = await c.env.DB.prepare(`
      SELECT ip_address, user_agent, login_at, login_status
      FROM login_history
      WHERE user_id = ?
      ORDER BY login_at DESC
      LIMIT 20
    `).bind(payload.userId).all();

    return c.json({
      history: history.results,
    });
  } catch (error) {
    console.error('Get login history error:', error);
    return c.json({ error: '获取登录历史失败' }, 500);
  }
});

export default userRoutes;