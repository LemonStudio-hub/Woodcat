/**
 * 光球游戏逻辑
 */

import { ref, onUnmounted } from 'vue';
import {
  BALL_CONFIG,
  GAME_CONFIG,
  type Ball,
} from '@/constants/lightBallConstants';

export function useLightBallGame() {
  // ========== 球状态 ==========
  const ball = ref<Ball>({
    position: { x: GAME_CONFIG.SCREEN_WIDTH / 2, y: GAME_CONFIG.SCREEN_HEIGHT / 2 },
    radius: BALL_CONFIG.RADIUS,
  });

  // ========== 游戏循环 ==========
  let gameLoopTimer: number | null = null;

  // ========== 球移动 ==========
  function moveBall(dx: number, dy: number): void {
    // 归一化向量
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    // 更新位置
    ball.value.position.x += normalizedX * BALL_CONFIG.SPEED;
    ball.value.position.y += normalizedY * BALL_CONFIG.SPEED;

    // 边界限制
    ball.value.position.x = Math.max(ball.value.radius, Math.min(GAME_CONFIG.SCREEN_WIDTH - ball.value.radius, ball.value.position.x));
    ball.value.position.y = Math.max(ball.value.radius, Math.min(GAME_CONFIG.SCREEN_HEIGHT - ball.value.radius, ball.value.position.y));
  }

  // ========== 游戏循环 ==========
  function startGameLoop(): void {
    gameLoopTimer = window.setInterval(() => {
      // 游戏循环逻辑（如果需要）
    }, 16); // 约60FPS
  }

  function stopGameLoop(): void {
    if (gameLoopTimer !== null) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
  }

  // ========== 组件清理 ==========
  onUnmounted(() => {
    stopGameLoop();
  });

  return {
    // 状态
    ball,
    // 方法
    moveBall,
    startGameLoop,
    stopGameLoop,
  };
}