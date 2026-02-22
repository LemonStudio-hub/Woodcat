/**
 * 井字棋游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type TicTacToeGameData } from '@/services/persistenceService';

export const useTicTacToeStore = defineStore('ticTacToe', () => {
  // ========== 状态 ==========

  /**
   * X 获胜次数
   */
  const xWins = ref<number>(0);

  /**
   * O 获胜次数
   */
  const oWins = ref<number>(0);

  /**
   * 平局次数
   */
  const draws = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新游戏结果
   */
  function updateResult(result: 'x' | 'o' | 'draw'): void {
    if (result === 'x') {
      xWins.value++;
    } else if (result === 'o') {
      oWins.value++;
    } else {
      draws.value++;
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
    xWins.value = 0;
    oWins.value = 0;
    draws.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadTicTacToeGame();
    xWins.value = data.stats.xWins;
    oWins.value = data.stats.oWins;
    draws.value = data.stats.draws;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: TicTacToeGameData = {
      stats: {
        xWins: xWins.value,
        oWins: oWins.value,
        draws: draws.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveTicTacToeGame(data);
  }

  // 监听状态变化，自动保存
  watch([xWins, oWins, draws], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    xWins,
    oWins,
    draws,
    // Actions
    updateResult,
    resetGame,
    resetAllStats,
    loadState,
  };
});