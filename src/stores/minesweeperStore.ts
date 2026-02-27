/**
 * 扫雷游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type MinesweeperGameData } from '@/services/persistenceService';
import type { MinesweeperStats } from '@/constants/minesweeperConstants';

export const useMinesweeperStore = defineStore('minesweeper', () => {
  // ========== 状态 ==========

  /**
   * 游戏统计
   */
  const stats = ref<MinesweeperStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    bestTimes: {
      easy: null,
      medium: null,
      hard: null,
    },
  });

  // ========== Actions ==========

  /**
   * 更新游戏统计
   */
  function updateStats(won: boolean): void {
    stats.value.gamesPlayed++;
    if (won) {
      stats.value.gamesWon++;
    } else {
      stats.value.gamesLost++;
    }
  }

  /**
   * 更新最佳时间
   */
  function updateBestTime(difficulty: 'easy' | 'medium' | 'hard', time: number): void {
    const currentBest = stats.value.bestTimes[difficulty];
    if (currentBest === null || time < currentBest) {
      stats.value.bestTimes[difficulty] = time;
    }
  }

  /**
   * 重置游戏状态
   */
  function resetGame(): void {
    // 游戏状态由 composable 管理
  }

  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    stats.value = {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      bestTimes: {
        easy: null,
        medium: null,
        hard: null,
      },
    };
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadMinesweeperGame();
    stats.value = data.stats;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: MinesweeperGameData = {
      stats: stats.value,
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveMinesweeperGame(data);
  }

  // 监听状态变化，自动保存
  watch(stats, () => {
    saveState();
  }, { deep: true });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    stats,
    // Actions
    updateStats,
    updateBestTime,
    resetGame,
    resetAllStats,
    loadState,
  };
});