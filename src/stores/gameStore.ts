/**
 * 游戏状态管理 Store
 * 使用 Pinia 管理全局游戏状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RPSChoice, RPSResult, RPSGameHistory } from '@/types/game';
import { MAX_HISTORY_COUNT } from '@/constants/gameConstants';

/**
 * 游戏状态 Store
 */
export const useGameStore = defineStore('game', () => {
  // ========== 状态 ==========
  
  /**
   * 玩家当前选择的选项
   */
  const playerChoice = ref<RPSChoice | null>(null);
  
  /**
   * 电脑当前选择的选项
   */
  const computerChoice = ref<RPSChoice | null>(null);
  
  /**
   * 当前游戏结果
   */
  const currentResult = ref<RPSResult | null>(null);
  
  /**
   * 游戏是否正在进行中
   */
  const isPlaying = ref<boolean>(false);
  
  /**
   * 玩家获胜次数
   */
  const playerWins = ref<number>(0);
  
  /**
   * 电脑获胜次数
   */
  const computerWins = ref<number>(0);
  
  /**
   * 平局次数
   */
  const drawCount = ref<number>(0);
  
  /**
   * 游戏历史记录
   */
  const gameHistory = ref<RPSGameHistory[]>([]);

  // ========== 计算属性 ==========
  
  /**
   * 总游戏次数
   */
  const totalGames = computed(() => playerWins.value + computerWins.value + drawCount.value);
  
  /**
   * 玩家胜率
   */
  const playerWinRate = computed(() => {
    if (totalGames.value === 0) return 0;
    return Math.round((playerWins.value / totalGames.value) * 100);
  });

  // ========== Actions ==========
  
  /**
   * 开始游戏
   */
  function startGame(): void {
    isPlaying.value = true;
    playerChoice.value = null;
    computerChoice.value = null;
    currentResult.value = null;
  }
  
  /**
   * 设置玩家选择
   */
  function setPlayerChoice(choice: RPSChoice): void {
    playerChoice.value = choice;
  }
  
  /**
   * 设置电脑选择
   */
  function setComputerChoice(choice: RPSChoice): void {
    computerChoice.value = choice;
  }
  
  /**
   * 设置游戏结果
   */
  function setCurrentResult(result: RPSResult): void {
    currentResult.value = result;
  }
  
  /**
   * 更新分数
   */
  function updateScore(result: RPSResult): void {
    if (result === 'win') {
      playerWins.value++;
    } else if (result === 'lose') {
      computerWins.value++;
    } else {
      drawCount.value++;
    }
  }
  
  /**
   * 添加历史记录
   */
  function addHistory(history: RPSGameHistory): void {
    gameHistory.value.unshift(history);
    if (gameHistory.value.length > MAX_HISTORY_COUNT) {
      gameHistory.value = gameHistory.value.slice(0, MAX_HISTORY_COUNT);
    }
  }
  
  /**
   * 结束游戏
   */
  function endGame(): void {
    isPlaying.value = false;
  }
  
  /**
   * 重置游戏
   */
  function resetGame(): void {
    playerChoice.value = null;
    computerChoice.value = null;
    currentResult.value = null;
    isPlaying.value = false;
  }
  
  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    playerWins.value = 0;
    computerWins.value = 0;
    drawCount.value = 0;
    gameHistory.value = [];
    resetGame();
  }

  return {
    // 状态
    playerChoice,
    computerChoice,
    currentResult,
    isPlaying,
    playerWins,
    computerWins,
    drawCount,
    gameHistory,
    // 计算属性
    totalGames,
    playerWinRate,
    // Actions
    startGame,
    setPlayerChoice,
    setComputerChoice,
    setCurrentResult,
    updateScore,
    addHistory,
    endGame,
    resetGame,
    resetAllStats,
  };
});