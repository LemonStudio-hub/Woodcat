/**
 * 2048 游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type Game2048Data } from '@/services/persistenceService';

export const useGame2048Store = defineStore('game2048', () => {
  // ========== 状态 ==========

  /**
   * 游戏分数
   */
  const score = ref<number>(0);

  /**
   * 最高分数
   */
  const bestScore = ref<number>(0);

  /**
   * 游戏是否结束
   */
  const gameOver = ref<boolean>(false);

  /**
   * 游戏是否获胜
   */
  const gameWon = ref<boolean>(false);

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
   * 设置游戏结束
   */
  function setGameOver(value: boolean): void {
    gameOver.value = value;
  }

  /**
   * 设置游戏获胜
   */
  function setGameWon(value: boolean): void {
    gameWon.value = value;
  }

  /**
   * 重置游戏状态
   */
  function resetGame(): void {
    score.value = 0;
    gameOver.value = false;
    gameWon.value = false;
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
    const data = persistenceService.loadGame2048();
    score.value = data.stats.score;
    bestScore.value = data.stats.bestScore;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: Game2048Data = {
      stats: {
        score: score.value,
        bestScore: bestScore.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveGame2048(data);
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
    gameOver,
    gameWon,
    // Actions
    updateScore,
    setGameOver,
    setGameWon,
    resetGame,
    resetAllStats,
    loadState,
  };
});