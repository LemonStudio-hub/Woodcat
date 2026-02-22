/**
 * 国际跳棋游戏状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { persistenceService, type InternationalCheckersGameData } from '@/services/persistenceService';

export const useInternationalCheckersStore = defineStore('internationalCheckers', () => {
  // ========== 状态 ==========

  /**
   * 红方获胜次数
   */
  const redWins = ref<number>(0);

  /**
   * 黑方获胜次数
   */
  const blackWins = ref<number>(0);

  // ========== Actions ==========

  /**
   * 更新获胜次数
   */
  function updateWins(winner: 'red' | 'black'): void {
    if (winner === 'red') redWins.value++;
    else blackWins.value++;
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
    redWins.value = 0;
    blackWins.value = 0;
  }

  /**
   * 加载状态
   */
  function loadState(): void {
    const data = persistenceService.loadInternationalCheckersGame();
    redWins.value = data.stats.redWins;
    blackWins.value = data.stats.blackWins;
  }

  // ========== 持久化 ==========

  /**
   * 保存状态
   */
  function saveState(): void {
    const data: InternationalCheckersGameData = {
      stats: {
        redWins: redWins.value,
        blackWins: blackWins.value,
      },
      gameState: null, // 游戏状态由 composable 管理
    };
    persistenceService.saveInternationalCheckersGame(data);
  }

  // 监听状态变化，自动保存
  watch([redWins, blackWins], () => {
    saveState();
  });

  // 初始化时加载数据
  loadState();

  return {
    // 状态
    redWins,
    blackWins,
    // Actions
    updateWins,
    resetGame,
    resetAllStats,
    loadState,
  };
});