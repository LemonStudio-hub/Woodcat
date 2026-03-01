/**
 * 通知状态管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notification } from '@/types/notification';
import { persistenceService } from '@/services/persistenceService';

/**
 * 通知状态管理
 */
export const useNotificationStore = defineStore('notification', () => {
  // 通知列表
  const notifications = ref<Notification[]>([]);

  /**
   * 未读通知数量
   */
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length;
  });

  /**
   * 加载通知
   */
  function loadNotifications(): void {
    const data = persistenceService.loadNotifications();
    notifications.value = data.notifications || [];

    // 如果没有通知，初始化第一则通知
    if (notifications.value.length === 0) {
      initializeDefaultNotifications();
    }
  }

  /**
   * 初始化默认通知
   */
  function initializeDefaultNotifications(): void {
    const defaultNotification: Notification = {
      id: 1,
      title: '欢迎来到木头猫！',
      body: `游戏玩法指南

各游戏玩法说明：

1. 五子棋
- 黑白双方轮流在棋盘交叉点落子
- 先形成五子连线者获胜
- 支持人机对战和双人对战模式

2. 国际跳棋
- 双方轮流移动棋子
- 普通棋子只能向前斜进
- 跳过对方棋子可吃子
- 到达对方底线升级为王，可向任意方向移动

3. 中国象棋
- 楚河汉界，红黑对弈
- 每种棋子有特定走法
- 将帅不可直接对面
- 将死对方将帅即获胜

4. 俄罗斯方块
- 旋转、移动下落的方块
- 消除满行得分
- 方块堆到顶部游戏结束

5. 贪吃蛇
- 控制蛇移动吃食物
- 食物越多，蛇越长
- 撞墙或撞到自己游戏结束

6. 扫雷
- 点击格子翻开
- 数字表示周围地雷数量
- 标记所有地雷即获胜

7. 2048
- 滑动合并相同数字
- 目标是合成2048
- 数字越大，得分越高

8. 井字棋
- 3x3格子，轮流落子
- 先形成三子连线者获胜
- 简单易上手

9. 围棋
- 黑白双方交替落子
- 包围对方棋子可吃子
- 占地多者获胜

10. 光球
- 控制发光球移动
- 避开彩色小球
- 坚持时间越长得分越高

注意事项

- 请合理安排游戏时间，避免沉迷
- 长时间游戏请注意休息，保护视力
- 遇到问题可通过社区反馈
- 游戏数据保存在本地，清除浏览器数据会丢失

免责声明

1. 本平台提供游戏仅供娱乐，不得用于商业目的
2. 游戏内容仅供参考，不代表任何立场
3. 用户应自行承担使用本平台的风险
4. 本平台不对游戏过程中产生的任何损失负责
5. 用户应遵守当地法律法规，合法使用
6. 本平台保留随时修改或终止服务的权利
7. 禁止利用本平台进行任何违法活动
8. 游戏数据仅供参考，不构成任何建议

感谢您的理解与支持！祝您游戏愉快！`,
      icon: '',
      tags: ['公告', '指南', '重要'],
      read: false,
      createdAt: Date.now(),
    };

    notifications.value = [defaultNotification];
    saveNotifications();
  }

  /**
   * 标记通知为已读
   */
  function markAsRead(id: number): void {
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      saveNotifications();
    }
  }

  /**
   * 标记所有通知为已读
   */
  function markAllAsRead(): void {
    notifications.value.forEach(n => {
      n.read = true;
    });
    saveNotifications();
  }

  /**
   * 保存通知
   */
  function saveNotifications(): void {
    persistenceService.saveNotifications({
      notifications: notifications.value,
    });
  }

  /**
   * 添加通知
   */
  function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: Date.now(),
    };
    notifications.value.unshift(newNotification);
    saveNotifications();
  }

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
});