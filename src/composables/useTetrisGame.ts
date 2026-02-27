/**
 * 俄罗斯方块游戏逻辑
 * 使用 Composition API 管理游戏状态
 */

import { ref, computed, watch } from 'vue';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BlockType,
  GameState,
  BLOCK_SHAPES,
  BLOCK_TYPES,
  DROP_SPEED,
} from '@/constants/tetrisConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService } from '@/services/vibrationService';

/**
 * 当前方块位置和类型
 */
interface CurrentBlock {
  type: BlockType;
  x: number;
  y: number;
  shape: number[][];
}

/**
 * 俄罗斯方块游戏逻辑
 */
export function useTetrisGame() {
  // ========== 状态 ==========
  
  /**
   * 棋盘状态（二维数组）
   */
  const board = ref<BlockType[][]>([]);
  
  /**
   * 游戏状态
   */
  const gameState = ref<GameState>(GameState.PLAYING);
  
  /**
   * 分数
   */
  const score = ref<number>(0);
  
  /**
   * 最高分
   */
  const highScore = ref<number>(0);
  
  /**
   * 当前方块
   */
  const currentBlock = ref<CurrentBlock | null>(null);
  
  /**
   * 正在消除的行（用于动画）
   */
  const clearingLines = ref<number[]>([]);
  
  /**
   * 游戏计时器
   */
  let gameTimer: number | null = null;
  
  // ========== 持久化 ==========
  
  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    const data = persistenceService.loadTetrisGame();
    
    // 加载统计数据
    highScore.value = data.stats.highScore;

    // 初始化新游戏
    initBoard();
  }

  /**
   * 清除游戏状态
   */
  function clearGameState(): void {
    const data = persistenceService.loadTetrisGame();
    persistenceService.saveTetrisGame({
      stats: data.stats,
      gameState: null,
    });
  }
  
  // 监听数据变化，自动保存
  watch([score, highScore], () => {
    if (score.value > highScore.value) {
      highScore.value = score.value;
    }
    const data = persistenceService.loadTetrisGame();
    persistenceService.saveTetrisGame({
      stats: {
        highScore: highScore.value,
      },
      gameState: data.gameState,
    });
  });
  
  // 初始化时加载数据
  loadGameState();  
  // ========== 计算属性 ==========
  
  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (gameState.value === GameState.GAME_OVER) {
      return `游戏结束！得分：${score.value}`;
    }
    return `得分：${score.value}`;
  });
  
  // ========== 辅助函数 ==========
  
  /**
   * 初始化棋盘
   */
  function initBoard(): void {
    board.value = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      board.value.push(new Array(BOARD_WIDTH).fill(BlockType.EMPTY));
    }
  }
  
  /**
   * 生成随机方块
   */
  function getRandomBlock(): BlockType {
    const randomIndex = Math.floor(Math.random() * BLOCK_TYPES.length);
    return BLOCK_TYPES[randomIndex];
  }
  
  /**
   * 创建新方块
   */
  function createNewBlock(): CurrentBlock {
    const type = getRandomBlock();
    const shape = BLOCK_SHAPES[type];
    const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
    const y = 0;
    
    return { type, x, y, shape };
  }
  
  /**
   * 检查碰撞
   */
  function checkCollision(block: CurrentBlock, offsetX: number = 0, offsetY: number = 0): boolean {
    const shape = block.shape;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== BlockType.EMPTY) {
          const newX = block.x + x + offsetX;
          const newY = block.y + y + offsetY;
          
          // 检查边界
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          // 检查是否与已有方块碰撞
          if (newY >= 0 && board.value[newY][newX] !== BlockType.EMPTY) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * 固定方块到棋盘
   */
  function fixBlockToBoard(block: CurrentBlock): void {
    const shape = block.shape;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== BlockType.EMPTY) {
          const boardX = block.x + x;
          const boardY = block.y + y;
          
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            board.value[boardY][boardX] = block.type;
          }
        }
      }
    }
  }
  
  /**
   * 消除完整的行
   */
  function clearLines(): void {
    const linesToClear: number[] = [];
    
    // 找出所有需要消除的行
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      const isFull = board.value[y].every((cell) => cell !== BlockType.EMPTY);
      if (isFull) {
        linesToClear.push(y);
      }
    }
    
    if (linesToClear.length > 0) {
      // 标记需要消除的行，触发动画
      clearingLines.value = linesToClear;
      
      // 播放消除音效和震动
      audioService.play(SoundType.CLEAR);
      vibrationService.vibrateCustom([80, 40, 80, 40, 100]);
      
      // 延迟后实际删除行
      setTimeout(() => {
        for (const y of linesToClear.sort((a, b) => b - a)) {
          board.value.splice(y, 1);
          board.value.unshift(new Array(BOARD_WIDTH).fill(BlockType.EMPTY));
        }
        clearingLines.value = [];
        
        // 更新分数
        score.value += linesToClear.length * 100;
      }, 300); // 等待动画完成
    }
  }
  
  /**
   * 检查游戏是否结束
   */
  function checkGameOver(): boolean {
    // 检查顶行是否有方块
    return board.value[0].some((cell) => cell !== BlockType.EMPTY);
  }
  
  /**
   * 旋转方块
   */
  function rotateShape(shape: number[][]): number[][] {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated: number[][] = [];
    
    for (let x = 0; x < cols; x++) {
      rotated[x] = [];
      for (let y = rows - 1; y >= 0; y--) {
        rotated[x].push(shape[y][x]);
      }
    }
    
    return rotated;
  }
  
  // ========== 游戏逻辑 ==========
  
  /**
   * 下落方块
   */
  function dropBlock(): void {
    if (!currentBlock.value || gameState.value !== GameState.PLAYING) {
      return;
    }
    
    if (!checkCollision(currentBlock.value, 0, 1)) {
      currentBlock.value.y++;
    } else {
      // 固定方块到棋盘
      fixBlockToBoard(currentBlock.value);
      
      // 消除完整的行
      clearLines();
      
      // 检查游戏是否结束
          if (checkGameOver()) {
            gameState.value = GameState.GAME_OVER;
            stopGame();
            // 播放游戏结束音效和震动
            audioService.play(SoundType.GAME_OVER);
            vibrationService.vibrateCustom([200, 100, 200, 100, 300]);
            return;
          }      
      // 创建新方块
      currentBlock.value = createNewBlock();
      
      // 检查新方块是否可以放置
      if (checkCollision(currentBlock.value)) {
        gameState.value = GameState.GAME_OVER;
        stopGame();
      }
    }
  }
  
  /**
   * 移动方块
   */
  function moveBlock(offsetX: number): void {
    if (!currentBlock.value || gameState.value !== GameState.PLAYING) {
      return;
    }
    
    if (!checkCollision(currentBlock.value, offsetX, 0)) {
      currentBlock.value.x += offsetX;
    }
  }
  
  /**
   * 旋转方块
   */
  function rotateBlock(): void {
    if (!currentBlock.value || gameState.value !== GameState.PLAYING) {
      return;
    }
    
    const rotatedShape = rotateShape(currentBlock.value.shape);
    const rotatedBlock = {
      ...currentBlock.value,
      shape: rotatedShape,
    };
    
    // 尝试旋转，如果碰撞则尝试左右移动
    if (!checkCollision(rotatedBlock)) {
      currentBlock.value = rotatedBlock;
      // 播放旋转音效和震动
      audioService.play(SoundType.ROTATE);
      vibrationService.vibrateCustom([15]);
    } else if (!checkCollision(rotatedBlock, 1, 0)) {
      currentBlock.value = {
        ...rotatedBlock,
        x: rotatedBlock.x + 1,
      };
      audioService.play(SoundType.ROTATE);
      vibrationService.vibrateCustom([15]);
    } else if (!checkCollision(rotatedBlock, -1, 0)) {
      currentBlock.value = {
        ...rotatedBlock,
        x: rotatedBlock.x - 1,
      };
      audioService.play(SoundType.ROTATE);
      vibrationService.vibrateCustom([15]);
    }
  }
  
  /**
   * 快速下落
   */
  function hardDrop(): void {
    if (!currentBlock.value || gameState.value !== GameState.PLAYING) {
      return;
    }
    
    while (!checkCollision(currentBlock.value, 0, 1)) {
      currentBlock.value.y++;
    }
    
    // 播放下落音效和震动
    audioService.play(SoundType.DROP);
    vibrationService.vibrateCustom([30]);
    
    // 固定方块到棋盘
    fixBlockToBoard(currentBlock.value);
    
    // 消除完整的行
    clearLines();
    
    // 检查游戏是否结束
    if (checkGameOver()) {
      gameState.value = GameState.GAME_OVER;
      audioService.play(SoundType.GAME_OVER);
      stopGame();
      return;
    }
    
    // 创建新方块
    currentBlock.value = createNewBlock();
    
    // 检查新方块是否可以放置
    if (checkCollision(currentBlock.value)) {
      gameState.value = GameState.GAME_OVER;
      audioService.play(SoundType.GAME_OVER);
      stopGame();
    }
  }
  
  /**
   * 开始游戏
   */
  function startGame(): void {
    initBoard();
    gameState.value = GameState.PLAYING;
    score.value = 0;
    currentBlock.value = createNewBlock();
    
    // 开始游戏循环
    if (gameTimer) {
      clearInterval(gameTimer);
    }
    gameTimer = window.setInterval(dropBlock, DROP_SPEED);
  }
  
  /**
   * 停止游戏
   */
  function stopGame(): void {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
  }
  
  /**
   * 重新开始游戏
   */
  function restartGame(): void {
    stopGame();
    startGame();
    clearGameState();
  }
  
  /**
   * 导出游戏逻辑
   */
  return {
    // 状态
    board,
    gameState,
    score,
    highScore,
    currentBlock,
    clearingLines,
    statusText,
    // 方法
    moveBlock,
    rotateBlock,
    hardDrop,
    startGame,
    restartGame,
    loadGameState,
    clearGameState,
  };
}