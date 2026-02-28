/**
 * Turnstile 验证工具
 */

export interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * 验证 Turnstile token
 */
export async function verifyTurnstile(secret: string, token: string): Promise<TurnstileResponse> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    const result = await response.json() as TurnstileResponse;
    return result;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      'error-codes': ['verification-failed'],
    };
  }
}