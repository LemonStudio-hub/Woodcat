/**
 * 游戏类型定义
 * 定义游戏中使用的各种数据类型
 */

/**
 * 石头剪刀布的选项
 */
export enum RPSChoice {
  ROCK = 'rock',
  PAPER = 'paper',
  SCISSORS = 'scissors',
}

/**
 * 游戏结果类型
 */
export enum RPSResult {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
}

/**
 * 石头剪刀布游戏历史记录
 */
export interface RPSGameHistory {
  playerChoice: RPSChoice;
  computerChoice: RPSChoice;
  result: RPSResult;
  timestamp: number;
}

/**
 * 游戏信息接口
 */
export interface GameInfo {
  id: string;
  name: string;
  description: string;
  route: string;
}