/**
 * 五子棋游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type GomokuGameData } from '@/services/persistenceService';

export const useGomokuStore = defineStore('gomoku', () => {
  // ========== 状态 ==========

  /**
   * 黑子获胜次数
   */
  const blackWins = ref<number>(0);

  /**
   * 白子获胜次数
   */
  const whiteWins = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新获胜次数
   */
  function updateWins(winner: 'black' | 'white'): void {
    if (winner === 'black') {
      blackWins.value++;
    } else {
      whiteWins.value++;
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
    blackWins.value = 0;
    whiteWins.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadGomokuGame();
    blackWins.value = data.stats.blackWins;
    whiteWins.value = data.stats.whiteWins;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: GomokuGameData = {
      stats: {
        blackWins: blackWins.value,
        whiteWins: whiteWins.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveGomokuGame(data);
  }

  // 监听状态变化，自动保存
  watch([blackWins, whiteWins], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    blackWins,
    whiteWins,
    // Actions
    updateWins,
    resetGame,
    resetAllStats,
    loadState,
  };
});