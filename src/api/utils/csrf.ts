/**
 * CSRF 保护工具
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * 生成 CSRF token
 */
export function generateCSRFToken(): string {
  const token = crypto.getRandomValues(new Uint8Array(CSRF_TOKEN_LENGTH));
  return Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证 CSRF token（使用恒定时间比较）
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}

export { CSRF_HEADER_NAME };