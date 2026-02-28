/**
 * 加密工具函数
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;

/**
 * 生成随机盐值
 */
async function generateSalt(): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用 PBKDF2 哈希密码（加盐）
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // 生成随机盐值
  const salt = await generateSalt();
  const saltData = encoder.encode(salt);
  
  // 使用 PBKDF2 派生密钥
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 返回盐值 + 哈希值，格式为：salt:hash
  return `${salt}:${hashHex}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':');
    
    if (!salt || !hash) {
      console.error('Invalid stored hash format');
      return false;
    }
    
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);
    
    // 使用相同的盐值重新计算哈希
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      256
    );
    
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 使用恒定时间比较，防止时序攻击
    return constantTimeCompare(computedHash, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * 恒定时间比较（防止时序攻击）
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * 生成 JWT token
 */
export async function generateToken(payload: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 }));
  const signature = await hmacSha256(encodedHeader + '.' + encodedPayload, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 验证 JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error('Invalid token format');
    }

    const expectedSignature = await hmacSha256(encodedHeader + '.' + encodedPayload, secret);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

/**
 * HMAC SHA256
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Base64 URL 编码
 */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL 解码
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}