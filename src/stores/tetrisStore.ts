/**
 * 俄罗斯方块游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type TetrisGameData } from '@/services/persistenceService';

export const useTetrisStore = defineStore('tetris', () => {
  // ========== 状态 ==========

  /**
   * 游戏分数
   */
  const score = ref<number>(0);

  /**
   * 最高分数
   */
  const highScore = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新分数
   */
  function updateScore(newScore: number): void {
    score.value = newScore;
    if (newScore > highScore.value) {
      highScore.value = newScore;
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
    highScore.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadTetrisGame();
    score.value = 0; // 当前分数每次重置
    highScore.value = data.stats.highScore;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: TetrisGameData = {
      stats: {
        highScore: highScore.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveTetrisGame(data);
  }

  // 监听状态变化，自动保存
  watch([score, highScore], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    score,
    highScore,
    // Actions
    updateScore,
    resetGame,
    resetAllStats,
    loadState,
  };
});