/**
 * 石头剪刀布游戏逻辑组合式函数
 * 封装游戏核心逻辑
 */

import { toRefs } from 'vue';
import { RPSChoice, RPSResult, type RPSGameHistory } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { useAIStrategy } from './useAIStrategy';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 石头剪刀布游戏逻辑
 */
export function useRockPaperScissors() {
  const gameStore = useGameStore();
  const { getAIChoice } = useAIStrategy();

  /**
   * 获取电脑选择（使用 AI 策略）
   */
  function getComputerChoice(): RPSChoice {
    // 使用历史记录让 AI 做出智能选择
    return getAIChoice(gameStore.gameHistory);
  }

  /**
   * 判断游戏结果
   * @param playerChoice 玩家选择
   * @param computerChoice 电脑选择
   * @returns 游戏结果
   */
  function determineResult(
    playerChoice: RPSChoice,
    computerChoice: RPSChoice,
  ): RPSResult {
    if (playerChoice === computerChoice) {
      return RPSResult.DRAW;
    }

    const winConditions: Record<RPSChoice, RPSChoice> = {
      [RPSChoice.ROCK]: RPSChoice.SCISSORS, // 石头胜剪刀
      [RPSChoice.PAPER]: RPSChoice.ROCK,    // 布胜石头
      [RPSChoice.SCISSORS]: RPSChoice.PAPER, // 剪刀胜布
    };

    return winConditions[playerChoice] === computerChoice
      ? RPSResult.WIN
      : RPSResult.LOSE;
  }

  /**
   * 执行游戏逻辑
   * @param playerChoice 玩家选择
   */
  function playRound(playerChoice: RPSChoice): void {
    // 开始游戏
    gameStore.startGame();
    
    // 设置玩家选择
    gameStore.setPlayerChoice(playerChoice);
    audioService.play(SoundType.CLICK);
    vibrationService.vibrate(VibrationType.MOVE);
    
    // 模拟思考延迟
    setTimeout(() => {
      // 获取电脑选择（使用 AI 策略）
      const computerChoice = getComputerChoice();
      gameStore.setComputerChoice(computerChoice);
      
      // 判断结果
      const result = determineResult(playerChoice, computerChoice);
      gameStore.setCurrentResult(result);
      
      // 播放音效和震动
      if (result === RPSResult.WIN) {
        audioService.play(SoundType.WIN);
        // 胜利时使用更强的震动模式
        vibrationService.vibrateCustom([0, 100, 50, 100, 50, 200]);
      } else if (result === RPSResult.LOSE) {
        audioService.play(SoundType.LOSE);
        // 失败时使用连续震动
        vibrationService.vibrateCustom([0, 100, 50, 100]);
      } else {
        audioService.play(SoundType.DRAW);
        // 平局时使用短震动
        vibrationService.vibrate(VibrationType.DRAW);
      }
      
      // 更新分数
      gameStore.updateScore(result);
      
      // 添加历史记录
      const history: RPSGameHistory = {
        playerChoice,
        computerChoice,
        result,
        timestamp: Date.now(),
      };
      gameStore.addHistory(history);
      
      // 结束游戏
      gameStore.endGame();
    }, 800); // 800ms延迟模拟思考
  }

  /**
   * 重置游戏
   */
  function resetGame(): void {
    gameStore.resetGame();
  }

  /**
   * 重置所有统计数据
   */
  function resetAllStats(): void {
    gameStore.resetAllStats();
  }

  return {
    // 状态
    ...toRefs(gameStore),
    // 方法
    playRound,
    resetGame,
    resetAllStats,
  };
}