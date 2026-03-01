/**
 * 通知类型定义
 */

/**
 * 通知接口
 */
export interface Notification {
  id: number;
  title: string;
  body: string;
  icon: string;
  tags?: string[];
  read: boolean;
  createdAt: number;
}

/**
 * 通知数据接口
 */
export interface NotificationData {
  notifications: Notification[];
}