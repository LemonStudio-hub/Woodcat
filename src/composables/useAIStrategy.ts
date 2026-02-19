/**
 * AI 策略组合式函数
 * 实现概率学习 AI，根据用户历史选择模式预测并做出最优决策
 */

import { RPSChoice, RPSGameHistory } from '@/types/game';

/**
 * AI 策略类型
 */
enum AIStrategyType {
  RANDOM = 'random', // 随机策略
  FREQUENCY = 'frequency', // 频率分析策略
  MARKOV = 'markov', // 马尔可夫链策略
  PATTERN = 'pattern', // 模式识别策略
}

/**
 * AI 策略管理器
 */
export function useAIStrategy() {
  /**
   * 计算每个选项的出现频率
   */
  function calculateFrequencies(history: RPSGameHistory[]): Map<RPSChoice, number> {
    const frequencies = new Map<RPSChoice, number>();
    frequencies.set(RPSChoice.ROCK, 0);
    frequencies.set(RPSChoice.PAPER, 0);
    frequencies.set(RPSChoice.SCISSORS, 0);

    history.forEach((record) => {
      const count = frequencies.get(record.playerChoice) || 0;
      frequencies.set(record.playerChoice, count + 1);
    });

    return frequencies;
  }

  /**
   * 计算用户选择转移矩阵（马尔可夫链）
   * 记录用户在选择了某个选项后，下一个选择的概率
   */
  function buildTransitionMatrix(history: RPSGameHistory[]): Map<RPSChoice, Map<RPSChoice, number>> {
    const matrix = new Map<RPSChoice, Map<RPSChoice, number>>();

    // 初始化矩阵
    [RPSChoice.ROCK, RPSChoice.PAPER, RPSChoice.SCISSORS].forEach((from) => {
      const toMap = new Map<RPSChoice, number>();
      toMap.set(RPSChoice.ROCK, 0);
      toMap.set(RPSChoice.PAPER, 0);
      toMap.set(RPSChoice.SCISSORS, 0);
      matrix.set(from, toMap);
    });

    // 统计转移次数
    for (let i = 0; i < history.length - 1; i++) {
      const from = history[i].playerChoice;
      const to = history[i + 1].playerChoice;
      const toMap = matrix.get(from);
      if (toMap) {
        const count = toMap.get(to) || 0;
        toMap.set(to, count + 1);
      }
    }

    return matrix;
  }

  /**
   * 使用频率分析策略预测用户下一步选择
   */
  function predictByFrequency(history: RPSGameHistory[]): RPSChoice | null {
    if (history.length < 3) {
      return null; // 数据不足，返回 null 使用随机策略
    }

    const frequencies = calculateFrequencies(history);
    const lastChoice = history[0].playerChoice;

    // 找出用户最常选择的选项（排除上一次的选择）
    let maxFrequency = 0;
    let predictedChoice: RPSChoice | null = null;

    frequencies.forEach((freq, choice) => {
      if (choice !== lastChoice && freq > maxFrequency) {
        maxFrequency = freq;
        predictedChoice = choice;
      }
    });

    // 如果只有一个选项被选择过，随机选择
    if (!predictedChoice) {
      const choices = ['rock', 'paper', 'scissors'] as RPSChoice[];
      return choices[Math.floor(Math.random() * choices.length)];
    }

    return predictedChoice;
  }

  /**
   * 使用马尔可夫链策略预测用户下一步选择
   */
  function predictByMarkov(history: RPSGameHistory[]): RPSChoice | null {
    if (history.length < 2) {
      return null; // 数据不足，返回 null 使用随机策略
    }

    const matrix = buildTransitionMatrix(history);
    const lastChoice = history[0].playerChoice;
    const transitions = matrix.get(lastChoice);

    if (!transitions) {
      return null;
    }

    // 找出转移概率最高的选项
    let maxCount = 0;
    let predictedChoice: RPSChoice | null = null;

    transitions.forEach((count, choice) => {
      if (count > maxCount) {
        maxCount = count;
        predictedChoice = choice;
      }
    });

    // 如果没有转移数据，使用频率分析
    if (!predictedChoice || maxCount === 0) {
      return predictByFrequency(history);
    }

    return predictedChoice;
  }

  /**
   * 检测用户的重复模式
   */
  function detectPattern(history: RPSGameHistory[]): RPSChoice | null {
    if (history.length < 6) {
      return null;
    }

    const recent = history.slice(0, 3).map((h) => h.playerChoice);
    
    // 检查是否有重复的3步模式
    for (let i = 3; i < history.length - 2; i++) {
      const pattern = history.slice(i, i + 3).map((h) => h.playerChoice);
      if (patternsMatch(recent, pattern)) {
        // 找到匹配模式，返回模式后的下一个选择
        if (i + 3 < history.length) {
          return history[i + 3].playerChoice;
        }
      }
    }

    return null;
  }

  /**
   * 比较两个模式是否匹配
   */
  function patternsMatch(pattern1: RPSChoice[], pattern2: RPSChoice[]): boolean {
    return (
      pattern1[0] === pattern2[0] &&
      pattern1[1] === pattern2[1] &&
      pattern1[2] === pattern2[2]
    );
  }

  /**
   * 根据预测的用户选择，计算 AI 的最优选择
   */
  function calculateOptimalChoice(predictedPlayerChoice: RPSChoice): RPSChoice {
    const winConditions: Record<RPSChoice, RPSChoice> = {
      [RPSChoice.ROCK]: RPSChoice.SCISSORS, // 石头胜剪刀
      [RPSChoice.PAPER]: RPSChoice.ROCK,    // 布胜石头
      [RPSChoice.SCISSORS]: RPSChoice.PAPER, // 剪刀胜布
    };

    return winConditions[predictedPlayerChoice];
  }

  /**
   * 随机选择
   */
  function getRandomChoice(): RPSChoice {
    const choices: RPSChoice[] = [RPSChoice.ROCK, RPSChoice.PAPER, RPSChoice.SCISSORS];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  /**
   * 主要的 AI 决策函数
   * 综合使用多种策略预测用户选择
   */
  function getAIChoice(history: RPSGameHistory[]): RPSChoice {
    // 数据不足时使用随机策略
    if (history.length < 2) {
      return getRandomChoice();
    }

    let predictedChoice: RPSChoice | null = null;

    // 策略 1: 模式识别（最高优先级）
    predictedChoice = detectPattern(history);

    // 策略 2: 马尔可夫链（中等优先级）
    if (!predictedChoice) {
      predictedChoice = predictByMarkov(history);
    }

    // 策略 3: 频率分析（低优先级）
    if (!predictedChoice) {
      predictedChoice = predictByFrequency(history);
    }

    // 如果所有策略都无法预测，使用随机策略
    if (!predictedChoice) {
      return getRandomChoice();
    }

    // 根据预测的用户选择，计算 AI 的最优选择
    return calculateOptimalChoice(predictedChoice);
  }

  /**
   * 获取 AI 决策策略类型（用于调试和显示）
   */
  function getStrategyType(history: RPSGameHistory[]): AIStrategyType {
    if (history.length < 2) {
      return AIStrategyType.RANDOM;
    }

    if (detectPattern(history)) {
      return AIStrategyType.PATTERN;
    }

    if (predictByMarkov(history)) {
      return AIStrategyType.MARKOV;
    }

    if (predictByFrequency(history)) {
      return AIStrategyType.FREQUENCY;
    }

    return AIStrategyType.RANDOM;
  }

  return {
    getAIChoice,
    getStrategyType,
    calculateFrequencies,
    buildTransitionMatrix,
  };
}