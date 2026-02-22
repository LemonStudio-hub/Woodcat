/**
 * 贪吃蛇游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type SnakeGameData } from '@/services/persistenceService';

export const useSnakeStore = defineStore('snake', () => {
  // ========== 状态 ==========

  /**
   * 游戏分数
   */
  const score = ref<number>(0);

  /**
   * 最高分数
   */
  const bestScore = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新分数
   */
  function updateScore(newScore: number): void {
    score.value = newScore;
    if (newScore > bestScore.value) {
      bestScore.value = newScore;
    }
  }

  /**
   * 重置游戏状态
   */
  function resetGame(): void {
    score.value = 0;
  }

  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    resetGame();
    bestScore.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadSnakeGame();
    score.value = data.stats.score;
    bestScore.value = data.stats.bestScore;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: SnakeGameData = {
      stats: {
        score: score.value,
        bestScore: bestScore.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveSnakeGame(data);
  }

  // 监听状态变化，自动保存
  watch([score, bestScore], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    score,
    bestScore,
    // Actions
    updateScore,
    resetGame,
    resetAllStats,
    loadState,
  };
});