/**
 * 贪吃蛇游戏逻辑组合式函数
 * 封装游戏核心逻辑
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  BOARD_SIZE,
  INITIAL_SNAKE_LENGTH,
  GAME_SPEED,
  Direction,
  OPPOSITE_DIRECTION,
} from '@/constants/snakeConstants';
import { persistenceService } from '@/services/persistenceService';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

/**
 * 坐标接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 贪吃蛇游戏逻辑
 */
export function useSnakeGame() {
  // ========== 状态 ==========
  
  /**
   * 蛇身坐标数组
   */
  const snake = ref<Position[]>([]);
  
  /**
   * 食物坐标
   */
  const food = ref<Position>({ x: 0, y: 0 });
  
  /**
   * 当前方向
   */
  const direction = ref<Direction>(Direction.RIGHT);
  
  /**
   * 下一个方向（防止按键冲突）
   */
  const nextDirection = ref<Direction>(Direction.RIGHT);
  
  /**
   * 游戏是否进行中
   */
  const isPlaying = ref<boolean>(false);
  
  /**
   * 游戏是否结束
   */
  const isGameOver = ref<boolean>(false);
  
  /**
   * 当前分数
   */
  const score = ref<number>(0);
  
  /**
   * 最高分
   */
  const bestScore = ref<number>(0);

  // 游戏循环定时器
  let gameLoop: number | null = null;

  // ========== 辅助函数 ==========
  
  /**
   * 生成随机食物位置
   */
  function generateFood(): void {
    let newFood: Position;
    let isValidPosition: boolean;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      
      // 检查食物是否与蛇身重叠
      isValidPosition = !snake.value.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      );
    } while (!isValidPosition);
    
    food.value = newFood;
  }
  
  /**
   * 初始化蛇
   */
  function initSnake(): void {
    snake.value = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      snake.value.push({
        x: INITIAL_SNAKE_LENGTH - 1 - i,
        y: Math.floor(BOARD_SIZE / 2),
      });
    }
  }

  // ========== 持久化 ==========

  /**
   * 保存游戏状态
   */
  function saveGameState(): void {
    const gameState = {
      snake: snake.value,
      food: food.value,
      direction: direction.value,
      gameOver: isGameOver.value,
    };

    persistenceService.saveSnakeGame({
      stats: {
        score: score.value,
        bestScore: bestScore.value,
      },
      gameState,
    });
  }

  /**
   * 加载游戏状态
   */
  function loadGameState(): void {
    const data = persistenceService.loadSnakeGame();
    
    // 加载统计数据
    score.value = data.stats.score;
    bestScore.value = data.stats.bestScore;

    // 如果有游戏状态，恢复游戏
    if (data.gameState) {
      // 如果游戏已经结束，重新初始化而不是恢复失败状态
      if (data.gameState.gameOver) {
        initSnake();
        generateFood();
        isPlaying.value = false;
        isGameOver.value = false;
      } else {
        // 恢复游戏状态
        snake.value = data.gameState.snake;
        food.value = data.gameState.food;
        direction.value = data.gameState.direction as Direction;
        nextDirection.value = data.gameState.direction as Direction;
        isGameOver.value = data.gameState.gameOver;
        
        // 如果游戏没有结束，恢复游戏循环
        if (!isGameOver.value) {
          isPlaying.value = true;
          if (gameLoop) {
            clearInterval(gameLoop);
          }
          gameLoop = window.setInterval(gameLoopFn, GAME_SPEED);
        }
      }
    } else {
      // 初始化新游戏
      initSnake();
      generateFood();
      isPlaying.value = false;
      isGameOver.value = false;
    }
  }

  /**
   * 清除游戏状态
   */
  function clearGameState(): void {
    const data = persistenceService.loadSnakeGame();
    persistenceService.saveSnakeGame({
      stats: data.stats,
      gameState: null,
    });
  }

  // 监听分数和游戏状态变化，自动保存
  watch([score, bestScore, snake, food, direction, isGameOver], () => {
    if (isPlaying.value && !isGameOver.value) {
      saveGameState();
    }
  }, { deep: true });

  // 初始化时加载数据
  loadGameState();
  
  // ========== 计算属性 ==========
  
  /**
   * 游戏状态文本
   */
  const statusText = computed((): string => {
    if (isGameOver.value) return '游戏结束';
    if (!isPlaying.value) return '按方向键开始';
    return '游戏中...';
  });
  
  /**
   * 移动蛇
   */
  function moveSnake(): void {
    // 更新方向
    direction.value = nextDirection.value;
    
    // 计算新的头部位置
    const head = snake.value[0];
    const newHead: Position = { ...head };
    
    switch (direction.value) {
      case Direction.UP:
        newHead.y -= 1;
        break;
      case Direction.DOWN:
        newHead.y += 1;
        break;
      case Direction.LEFT:
        newHead.x -= 1;
        break;
      case Direction.RIGHT:
        newHead.x += 1;
        break;
    }
    
    // 检查碰撞
    if (checkCollision(newHead)) {
      endGame();
      return;
    }
    
    // 添加新的头部
    snake.value.unshift(newHead);
    
    // 检查是否吃到食物
    if (newHead.x === food.value.x && newHead.y === food.value.y) {
      score.value += 10;
      generateFood();
      // 增强吃食物的音效和震动
      audioService.play(SoundType.EAT);
      vibrationService.vibrateCustom([0, 80, 30, 80]);
    } else {
      // 没吃到食物，移除尾部
      snake.value.pop();
      // 移动时添加轻微震动反馈
      if (snake.value.length % 5 === 0) {
        vibrationService.vibrate(VibrationType.MOVE);
      }
    }
  }
  
  /**
   * 检查碰撞
   */
  function checkCollision(position: Position): boolean {
    // 检查是否撞墙
    if (
      position.x < 0 ||
      position.x >= BOARD_SIZE ||
      position.y < 0 ||
      position.y >= BOARD_SIZE
    ) {
      return true;
    }
    
    // 检查是否撞到自己
    return snake.value.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  }
  
  /**
   * 游戏循环
   */
  function gameLoopFn(): void {
    if (isPlaying.value && !isGameOver.value) {
      moveSnake();
    }
  }
  
  /**
   * 开始游戏
   */
  function startGame(): void {
    // 初始化游戏状态
    score.value = 0;
    initSnake();
    generateFood();
    
    // 设置游戏状态（在 initSnake 之后）
    isPlaying.value = true;
    isGameOver.value = false;
    direction.value = Direction.RIGHT;
    nextDirection.value = Direction.RIGHT;
    
    // 启动游戏循环
    if (gameLoop) {
      clearInterval(gameLoop);
    }
    gameLoop = window.setInterval(gameLoopFn, GAME_SPEED);
  }
  
  /**
   * 暂停游戏
   */
  function pauseGame(): void {
    isPlaying.value = false;
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
  }
  
  /**
   * 继续游戏
   */
  function continueGame(): void {
    if (!isGameOver.value) {
      isPlaying.value = true;
      if (gameLoop) {
        clearInterval(gameLoop);
      }
      gameLoop = window.setInterval(gameLoopFn, GAME_SPEED);
    }
  }
  
  /**
   * 结束游戏
   */
  function endGame(): void {
    isPlaying.value = false;
    isGameOver.value = true;
    audioService.play(SoundType.CRASH);
    // 增强碰撞时的震动反馈
    vibrationService.vibrateCustom([0, 150, 50, 150, 50, 200]);
    
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    
    // 更新最高分
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
    }
  }
  
  /**
   * 重启游戏
   */
  function restartGame(): void {
    startGame();
    clearGameState();
  }
  
  /**
   * 处理方向改变
   */
  function changeDirection(newDirection: Direction): void {
    // 防止反向移动
    if (OPPOSITE_DIRECTION[newDirection] !== direction.value) {
      nextDirection.value = newDirection;
    }
  }
  
    // ========== 生命周期 ==========
    
    onMounted(() => {
      // 清理定时器
      if (gameLoop) {
        clearInterval(gameLoop);
      }
    });
    
    onUnmounted(() => {
      // 清理定时器
      if (gameLoop) {
        clearInterval(gameLoop);
      }
    });
  return {
    // 状态
    snake,
    food,
    isPlaying,
    isGameOver,
    score,
    bestScore,
    statusText,
    // 方法
    startGame,
    pauseGame,
    continueGame,
    restartGame,
    changeDirection,
    loadGameState,
    clearGameState,
  };
}