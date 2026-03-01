/**
 * 光之子游戏逻辑
 */

import { ref, computed, onUnmounted } from 'vue';
import {
  GameState,
  PLAYER_CONFIG,
  ENEMY_CONFIG,
  PARTICLE_CONFIG,
  GAME_CONFIG,
  type Player,
  type Enemy,
  type Particle,
  type GameStats,
  KEY_BINDINGS,
} from '@/constants/lightSonConstants';
import { audioService, SoundType } from '@/services/audioService';
import { vibrationService, VibrationType } from '@/services/vibrationService';

export function useLightSonGame() {
  // ========== 游戏状态 ==========
  const gameState = ref<GameState>(GameState.READY);
  const player = ref<Player>({
    position: { x: GAME_CONFIG.SCREEN_WIDTH / 2, y: GAME_CONFIG.SCREEN_HEIGHT / 2 },
    radius: PLAYER_CONFIG.RADIUS,
    isMovingUp: false,
    isMovingDown: false,
    isMovingLeft: false,
    isMovingRight: false,
  });
  const enemies = ref<Enemy[]>([]);
  const particles = ref<Particle[]>([]);
  const gameStats = ref<GameStats>({
    survivalTime: 0,
    enemiesDodged: 0,
    enemiesExploded: 0,
  });

  // ========== 游戏计时 ==========
  let gameStartTime: number = 0;
  let gameLoopTimer: number | null = null;
  let enemySpawnTimer: number | null = null;
  let difficultyTimer: number | null = null;
  let currentSpawnRate: number = GAME_CONFIG.INITIAL_SPAWN_RATE;
  let enemyIdCounter = 0;
  let particleIdCounter = 0;

  // ========== 计算属性 ==========
  const survivalTimeFormatted = computed(() => {
    const seconds = Math.floor(gameStats.value.survivalTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  });

  const difficulty = computed(() => {
    // 难度系数：0（简单）到1（困难）
    const maxTime = 120000; // 2分钟后达到最大难度
    return Math.min(gameStats.value.survivalTime / maxTime, 1);
  });

  // ========== 游戏控制 ==========
  function startGame(): void {
    if (gameState.value === GameState.PLAYING) return;

    // 重置游戏状态
    gameState.value = GameState.PLAYING;
    player.value = {
      position: { x: GAME_CONFIG.SCREEN_WIDTH / 2, y: GAME_CONFIG.SCREEN_HEIGHT / 2 },
      radius: PLAYER_CONFIG.RADIUS,
      isMovingUp: false,
      isMovingDown: false,
      isMovingLeft: false,
      isMovingRight: false,
    };
    enemies.value = [];
    gameStats.value = {
      survivalTime: 0,
      enemiesDodged: 0,
      enemiesExploded: 0,
    };
    gameStartTime = Date.now();
    currentSpawnRate = GAME_CONFIG.INITIAL_SPAWN_RATE;
    enemyIdCounter = 0;

    // 启动游戏循环
    startGameLoop();
    startEnemySpawning();
    startDifficultyIncrease();

    audioService.play(SoundType.START);
    vibrationService.vibrate(VibrationType.START);
  }

  function endGame(): void {
    gameState.value = GameState.GAME_OVER;

    // 停止所有计时器
    stopGameLoop();
    stopEnemySpawning();
    stopDifficultyIncrease();

    audioService.play(SoundType.GAME_OVER);
    vibrationService.vibrate(VibrationType.GAME_OVER);
  }

  function restartGame(): void {
    startGame();
  }

  // ========== 游戏循环 ==========
  function startGameLoop(): void {
    gameLoopTimer = window.setInterval(() => {
      updateGame();
    }, 16); // 约60FPS
  }

  function stopGameLoop(): void {
    if (gameLoopTimer !== null) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
  }

  function updateGame(): void {
    if (gameState.value !== GameState.PLAYING) return;

    // 更新存活时间
    gameStats.value.survivalTime = Date.now() - gameStartTime;

    // 更新玩家位置
    updatePlayerPosition();

    // 更新敌人位置
    updateEnemies();

    // 更新粒子
    updateParticles();

    // 检测碰撞
    checkCollisions();

    // 清理已消失的敌人和粒子
    cleanupEnemies();
    cleanupParticles();
  }

  // ========== 玩家控制 ==========
  function updatePlayerPosition(): void {
    const { position, isMovingUp, isMovingDown, isMovingLeft, isMovingRight } = player.value;

    if (isMovingUp) {
      position.y = Math.max(PLAYER_CONFIG.RADIUS, position.y - PLAYER_CONFIG.SPEED);
    }
    if (isMovingDown) {
      position.y = Math.min(GAME_CONFIG.SCREEN_HEIGHT - PLAYER_CONFIG.RADIUS, position.y + PLAYER_CONFIG.SPEED);
    }
    if (isMovingLeft) {
      position.x = Math.max(PLAYER_CONFIG.RADIUS, position.x - PLAYER_CONFIG.SPEED);
    }
    if (isMovingRight) {
      position.x = Math.min(GAME_CONFIG.SCREEN_WIDTH - PLAYER_CONFIG.RADIUS, position.x + PLAYER_CONFIG.SPEED);
    }
  }

  function handleKeyDown(key: string): void {
    if (KEY_BINDINGS.UP.includes(key as any)) {
      player.value.isMovingUp = true;
    }
    if (KEY_BINDINGS.DOWN.includes(key as any)) {
      player.value.isMovingDown = true;
    }
    if (KEY_BINDINGS.LEFT.includes(key as any)) {
      player.value.isMovingLeft = true;
    }
    if (KEY_BINDINGS.RIGHT.includes(key as any)) {
      player.value.isMovingRight = true;
    }
  }

  function handleKeyUp(key: string): void {
    if (KEY_BINDINGS.UP.includes(key as any)) {
      player.value.isMovingUp = false;
    }
    if (KEY_BINDINGS.DOWN.includes(key as any)) {
      player.value.isMovingDown = false;
    }
    if (KEY_BINDINGS.LEFT.includes(key as any)) {
      player.value.isMovingLeft = false;
    }
    if (KEY_BINDINGS.RIGHT.includes(key as any)) {
      player.value.isMovingRight = false;
    }
  }

  // ========== 敌人生成 ==========
  function startEnemySpawning(): void {
    spawnEnemy(); // 立即生成一个
    enemySpawnTimer = window.setInterval(() => {
      spawnEnemy();
    }, currentSpawnRate);
  }

  function stopEnemySpawning(): void {
    if (enemySpawnTimer !== null) {
      clearInterval(enemySpawnTimer);
      enemySpawnTimer = null;
    }
  }

  function spawnEnemy(): void {
    // 从屏幕边缘随机生成
    const side = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
    let x: number = 0;
    let y: number = 0;

    switch (side) {
      case 0: // 上
        x = Math.random() * GAME_CONFIG.SCREEN_WIDTH;
        y = -ENEMY_CONFIG.MAX_RADIUS;
        break;
      case 1: // 右
        x = GAME_CONFIG.SCREEN_WIDTH + ENEMY_CONFIG.MAX_RADIUS;
        y = Math.random() * GAME_CONFIG.SCREEN_HEIGHT;
        break;
      case 2: // 下
        x = Math.random() * GAME_CONFIG.SCREEN_WIDTH;
        y = GAME_CONFIG.SCREEN_HEIGHT + ENEMY_CONFIG.MAX_RADIUS;
        break;
      case 3: // 左
        x = -ENEMY_CONFIG.MAX_RADIUS;
        y = Math.random() * GAME_CONFIG.SCREEN_HEIGHT;
        break;
    }

    // 计算朝向玩家的速度向量
    const dx = player.value.position.x - x;
    const dy = player.value.position.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = ENEMY_CONFIG.MIN_SPEED + Math.random() * (ENEMY_CONFIG.MAX_SPEED - ENEMY_CONFIG.MIN_SPEED);
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    // 随机颜色
    const color = ENEMY_CONFIG.COLORS[Math.floor(Math.random() * ENEMY_CONFIG.COLORS.length)];
    const radius = ENEMY_CONFIG.MIN_RADIUS + Math.random() * (ENEMY_CONFIG.MAX_RADIUS - ENEMY_CONFIG.MIN_RADIUS);

    const enemy: Enemy = {
      id: enemyIdCounter++,
      position: { x, y },
      velocity: { vx, vy },
      radius,
      color,
      isExploding: false,
      explosionStartTime: 0,
    };

    enemies.value.push(enemy);
  }

  // ========== 敌人更新 ==========
  function updateEnemies(): void {
    enemies.value.forEach((enemy) => {
      if (enemy.isExploding) {
        // 爆炸中的敌人不移动
        return;
      }

      // 更新位置
      enemy.position.x += enemy.velocity.vx;
      enemy.position.y += enemy.velocity.vy;
    });
  }

  // ========== 粒子更新 ==========
  function updateParticles(): void {
    particles.value.forEach((particle) => {
      // 更新位置
      particle.position.x += particle.velocity.vx;
      particle.position.y += particle.velocity.vy;

      // 应用摩擦力
      particle.velocity.vx *= PARTICLE_CONFIG.FRICTION;
      particle.velocity.vy *= PARTICLE_CONFIG.FRICTION;

      // 重力效果（可选）
      particle.velocity.vy += 0.1;
    });
  }

  // ========== 碰撞检测 ==========
  function checkCollisions(): void {
    const { position: playerPos, radius: playerRadius } = player.value;

    enemies.value.forEach((enemy) => {
      if (enemy.isExploding) {
        // 检测玩家是否被爆炸伤害
        const dx = playerPos.x - enemy.position.x;
        const dy = playerPos.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ENEMY_CONFIG.EXPLOSION_RADIUS + playerRadius) {
          endGame();
        }
        return;
      }

      // 检测玩家是否靠近敌人（触发爆炸）
      const dx = playerPos.x - enemy.position.x;
      const dy = playerPos.y - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ENEMY_CONFIG.EXPLOSION_DISTANCE) {
        // 敌人爆炸
        triggerExplosion(enemy);
      }
    });
  }

  function triggerExplosion(enemy: Enemy): void {
    enemy.isExploding = true;
    enemy.explosionStartTime = Date.now();
    gameStats.value.enemiesExploded++;

    // 生成粒子
    createParticles(enemy.position, enemy.color);

    audioService.play(SoundType.EXPLOSION);
    vibrationService.vibrate(VibrationType.EXPLOSION);
  }

  // ========== 粒子生成 ==========
  function createParticles(position: { x: number; y: number }, color: string): void {
    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_CONFIG.COUNT + Math.random() * 0.5;
      const speed = PARTICLE_CONFIG.MIN_SPEED + Math.random() * (PARTICLE_CONFIG.MAX_SPEED - PARTICLE_CONFIG.MIN_SPEED);
      const size = PARTICLE_CONFIG.MIN_SIZE + Math.random() * (PARTICLE_CONFIG.MAX_SIZE - PARTICLE_CONFIG.MIN_SIZE);

      const particle: Particle = {
        id: particleIdCounter++,
        position: { x: position.x, y: position.y },
        velocity: {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        },
        size,
        color,
        lifetime: PARTICLE_CONFIG.LIFETIME,
        birthTime: Date.now(),
      };

      particles.value.push(particle);
    }
  }

  // ========== 敌人清理 ==========
  function cleanupEnemies(): void {
    const now = Date.now();

    enemies.value = enemies.value.filter((enemy) => {
      // 移除爆炸完成的敌人
      if (enemy.isExploding) {
        const explosionElapsed = now - enemy.explosionStartTime;
        if (explosionElapsed > ENEMY_CONFIG.EXPLOSION_DURATION) {
          return false;
        }
      }

      // 移除超出屏幕太远的敌人（非爆炸状态）
      const margin = 100;
      if (!enemy.isExploding) {
        const { x, y } = enemy.position;
        if (x < -margin || x > GAME_CONFIG.SCREEN_WIDTH + margin ||
            y < -margin || y > GAME_CONFIG.SCREEN_HEIGHT + margin) {
          gameStats.value.enemiesDodged++;
          return false;
        }
      }

      return true;
    });
  }

  // ========== 粒子清理 ==========
  function cleanupParticles(): void {
    const now = Date.now();

    particles.value = particles.value.filter((particle) => {
      const age = now - particle.birthTime;
      return age < particle.lifetime;
    });
  }

  // ========== 难度增加 ==========
  function startDifficultyIncrease(): void {
    difficultyTimer = window.setInterval(() => {
      // 减少敌人生成间隔
      currentSpawnRate = Math.max(
        GAME_CONFIG.MIN_SPAWN_RATE,
        currentSpawnRate - GAME_CONFIG.SPAWN_RATE_DECREASE
      );

      // 重启生成计时器以应用新的生成率
      stopEnemySpawning();
      startEnemySpawning();
    }, GAME_CONFIG.DIFFICULTY_INCREASE_INTERVAL);
  }

  function stopDifficultyIncrease(): void {
    if (difficultyTimer !== null) {
      clearInterval(difficultyTimer);
      difficultyTimer = null;
    }
  }

  // ========== 组件清理 ==========
  onUnmounted(() => {
    stopGameLoop();
    stopEnemySpawning();
    stopDifficultyIncrease();
  });

  return {
    // 状态
    gameState,
    player,
    enemies,
    particles,
    gameStats,
    survivalTimeFormatted,
    difficulty,
    // 方法
    startGame,
    endGame,
    restartGame,
    handleKeyDown,
    handleKeyUp,
  };
}