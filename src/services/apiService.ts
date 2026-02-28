/**
 * API 服务
 * 统一处理 API 请求、CSRF token 和错误处理
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8787';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

class APIService {
  private csrfToken: string | null = null;

  /**
   * 获取 CSRF token
   */
  async getCSRFToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/csrf-token`);
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const data = await response.json() as { token: string };
      this.csrfToken = data.token || '';
      
      if (!this.csrfToken) {
        throw new Error('CSRF token is empty');
      }
      
      return this.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw new Error('获取安全令牌失败，请刷新页面重试');
    }
  }

  /**
   * 清除 CSRF token
   */
  clearCSRFToken(): void {
    this.csrfToken = null;
  }

  /**
   * 发送 API 请求
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
  
    // 对 POST/PUT/DELETE 请求添加 CSRF token
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      try {
        const csrfToken = await this.getCSRFToken();
        options.headers = {
          ...options.headers,
          [CSRF_HEADER_NAME]: csrfToken,
        };
      } catch (error) {
        console.error('Failed to add CSRF token:', error);
        throw new Error('获取安全令牌失败，请刷新页面重试');
      }
    }
  
    try {
        const response = await fetch(url, options);
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { error?: string; message?: string };
          const errorMessage = errorData.error || errorData.message || '请求失败';
          
          // 根据状态码提供更友好的错误信息
          switch (response.status) {
            case 400:
              throw new Error(errorMessage || '请求参数错误');
            case 401:
              throw new Error('未授权，请重新登录');
            case 403:
              throw new Error('没有权限访问该资源');
            case 404:
              throw new Error('请求的资源不存在');
            case 409:
              throw new Error(errorMessage || '资源冲突');
            case 429:
              throw new Error('请求过于频繁，请稍后再试');
            case 500:
              throw new Error('服务器内部错误，请稍后重试');
            default:
              throw new Error(errorMessage || '请求失败');
          }
        }
    
        return response.json();
      } catch (error) {      // 网络错误或其他异常
      if (error instanceof Error) {
        // 如果是我们已经处理过的错误，直接抛出
        if (error.message.includes('请求') || error.message.includes('未授权')) {
          throw error;
        }
        
        // 网络错误
        if (error.message.includes('fetch')) {
          throw new Error('网络连接失败，请检查网络设置');
        }
      }
      
      // 未知错误
      throw new Error('请求失败，请稍后重试');
    }
  }
  /**
   * GET 请求
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST 请求
   */
  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}

// 导出单例
export const apiService = new APIService();