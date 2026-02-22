/**
 * 国际象棋游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type ChessGameData } from '@/services/persistenceService';

export const useChessStore = defineStore('chess', () => {
  // ========== 状态 ==========

  /**
   * 白方获胜次数
   */
  const whiteWins = ref<number>(0);

  /**
   * 黑方获胜次数
   */
  const blackWins = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新获胜次数
   */
  function updateWins(winner: 'white' | 'black' | 'draw'): void {
    if (winner === 'white') whiteWins.value++;
    else if (winner === 'black') blackWins.value++;
    // 平局不计入获胜次数
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
    whiteWins.value = 0;
    blackWins.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadChessGame();
    whiteWins.value = data.stats.whiteWins;
    blackWins.value = data.stats.blackWins;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: ChessGameData = {
      stats: {
        whiteWins: whiteWins.value,
        blackWins: blackWins.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveChessGame(data);
  }

  // 监听状态变化，自动保存
  watch([whiteWins, blackWins], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    whiteWins,
    blackWins,
    // Actions
    updateWins,
    resetGame,
    resetAllStats,
    loadState,
  };
});