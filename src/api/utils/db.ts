/**
 * 数据库工具函数
 */

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_login_user_agent: string | null;
  is_verified: number;
}

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  lastLoginIp: string;
  lastLoginUserAgent: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface SessionData {
  userId: number;
  token: string;
  ip: string;
  userAgent: string;
}

/**
 * 根据邮箱获取用户
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).bind(email).first();
  
  return result as User | null;
}

/**
 * 根据用户名获取用户
 */
export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const result = await db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).bind(username).first();
  
  return result as User | null;
}

/**
 * 根据 ID 获取用户
 */
export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const result = await db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).bind(id).first();
  
  return result as User | null;
}

/**
 * 创建用户
 */
export async function createUser(db: D1Database, data: CreateUserData): Promise<User> {
  const result = await db.prepare(`
    INSERT INTO users (email, username, password_hash, last_login_ip, last_login_user_agent)
    VALUES (?, ?, ?, ?, ?)
  `).bind(data.email, data.username, data.passwordHash, data.lastLoginIp, data.lastLoginUserAgent).run();
  
  const user = await getUserById(db, result.meta.last_row_id);
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  return user;
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(db: D1Database, userId: number, data: UpdateProfileData): Promise<User> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.username !== undefined) {
    updates.push('username = ?');
    values.push(data.username);
  }

  if (data.bio !== undefined) {
    updates.push('bio = ?');
    values.push(data.bio);
  }

  if (data.avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    values.push(data.avatarUrl);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);

  await db.prepare(`
    UPDATE users SET ${updates.join(', ')} WHERE id = ?
  `).bind(...values).run();
  
  const user = await getUserById(db, userId);
  if (!user) {
    throw new Error('Failed to update user');
  }
  
  return user;
}

/**
 * 创建会话
 */
export async function createSession(db: D1Database, kv: KVNamespace, data: SessionData): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 天

  // 保存到数据库
  await db.prepare(`
    INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(data.userId, data.token, data.ip, data.userAgent, expiresAt.toISOString()).run();

  // 保存到 KV 缓存
  await kv.put(data.token, JSON.stringify({
    userId: data.userId,
    ip: data.ip,
    userAgent: data.userAgent,
    expiresAt: expiresAt.toISOString(),
  }), { expirationTtl: 30 * 24 * 60 * 60 });
}

/**
 * 记录登录历史
 */
export async function recordLoginHistory(
  db: D1Database,
  userId: number,
  ip: string,
  userAgent: string,
  status: 'success' | 'failed'
): Promise<void> {
  await db.prepare(`
    INSERT INTO login_history (user_id, ip_address, user_agent, login_status)
    VALUES (?, ?, ?, ?)
  `).bind(userId, ip, userAgent, status).run();
}