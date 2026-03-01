/**
 * 光球游戏逻辑
 */

import { ref, onUnmounted } from 'vue';
import {
  BALL_CONFIG,
  GAME_CONFIG,
  PARTICLE_CONFIG,
  ENEMY_BALL_CONFIG,
  GameState,
  Direction,
  type Ball,
  type Particle,
  type Position,
  type EnemyBall,
} from '@/constants/lightBallConstants';

export function useLightBallGame() {
  // ========== 球状态 ==========
  const ball = ref<Ball>({
    position: { x: 0, y: 0 }, // 将在 updateScreenSize 中初始化
    radius: BALL_CONFIG.RADIUS,
  });

  // 球的速度
  const ballVelocity = ref<Position>({ x: 0, y: 0 });

  // 粒子列表
  const particles = ref<Particle[]>([]);

  // 粒子ID计数器
  let particleIdCounter = 0;

  // 彩色小球列表
  const enemyBalls = ref<EnemyBall[]>([]);

  // 彩色小球ID计数器
  let enemyBallIdCounter = 0;

  // 游戏状态
  const gameState = ref<GameState>(GameState.PLAYING);

  // 屏幕尺寸
  const screenWidth = ref<number>(GAME_CONFIG.SCREEN_WIDTH);
  const screenHeight = ref<number>(GAME_CONFIG.SCREEN_HEIGHT);

  // 当前生成间隔
  const currentSpawnRate = ref<number>(ENEMY_BALL_CONFIG.SPAWN_INTERVAL);

  // 生成计时器
  let spawnTimer: number | null = null;

  // 难度增加计时器
  let difficultyTimer: number | null = null;

  // ========== 更新屏幕尺寸 ==========
  function updateScreenSize(width: number, height: number): void {
    screenWidth.value = width;
    screenHeight.value = height;

    // 如果球还没有初始化（位置为 0,0），则将其放置在屏幕中心
    if (ball.value.position.x === 0 && ball.value.position.y === 0) {
      ball.value.position.x = width / 2;
      ball.value.position.y = height / 2;
    } else {
      // 确保球在新的边界内
      ball.value.position.x = Math.max(ball.value.radius, Math.min(width - ball.value.radius, ball.value.position.x));
      ball.value.position.y = Math.max(ball.value.radius, Math.min(height - ball.value.radius, ball.value.position.y));
    }
  }

  // 动画状态
  const animationState = ref({
    pulse: 0,
    glowIntensity: 1,
  });

  // ========== 游戏循环 ==========
  let gameLoopTimer: number | null = null;
  let animationTimer: number | null = null;

  // ========== 球移动 ==========
  function moveBall(dx: number, dy: number): void {
    if (gameState.value !== GameState.PLAYING) return;

    // 归一化向量
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    // 设置速度
    ballVelocity.value.x = normalizedX * BALL_CONFIG.SPEED;
    ballVelocity.value.y = normalizedY * BALL_CONFIG.SPEED;
  }

  // ========== 停止球 ==========
  function stopBall(): void {
    ballVelocity.value.x = 0;
    ballVelocity.value.y = 0;
  }

  // ========== 创建碰撞粒子 ==========
  function createCollisionParticles(position: Position, color: string): void {
    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_CONFIG.COUNT + Math.random() * 0.3;
      const speed = PARTICLE_CONFIG.MIN_SPEED + Math.random() * (PARTICLE_CONFIG.MAX_SPEED - PARTICLE_CONFIG.MIN_SPEED);
      const size = PARTICLE_CONFIG.MIN_SIZE + Math.random() * (PARTICLE_CONFIG.MAX_SIZE - PARTICLE_CONFIG.MIN_SIZE);

      particles.value.push({
        id: particleIdCounter++,
        position: { x: position.x, y: position.y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        size,
        color,
        birthTime: Date.now(),
        lifetime: PARTICLE_CONFIG.LIFETIME,
      });
    }
  }

  // ========== 创建尾迹粒子 ==========
  function createTrailParticles(position: Position, velocity: Position): void {
    for (let i = 0; i < PARTICLE_CONFIG.TRAIL_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2;
      const size = PARTICLE_CONFIG.MIN_SIZE + Math.random() * 2;

      particles.value.push({
        id: particleIdCounter++,
        position: { 
          x: position.x - velocity.x * 0.5 + (Math.random() - 0.5) * 10,
          y: position.y - velocity.y * 0.5 + (Math.random() - 0.5) * 10,
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        size,
        color: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`,
        birthTime: Date.now(),
        lifetime: PARTICLE_CONFIG.TRAIL_LIFETIME,
      });
    }
  }

  // ========== 生成彩色小球 ==========
  function spawnEnemyBall(): void {
    const directions: Direction[] = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const color = ENEMY_BALL_CONFIG.COLORS[Math.floor(Math.random() * ENEMY_BALL_CONFIG.COLORS.length)];

    let position: Position;
    let velocity: Position;

    const r = ENEMY_BALL_CONFIG.RADIUS;
    const w = screenWidth.value;
    const h = screenHeight.value;
    const speed = ENEMY_BALL_CONFIG.SPEED;

    // 根据方向生成位置和速度，直线前进到相对边界
    switch (direction) {
      case Direction.UP:
        position = { x: Math.random() * (w - 2 * r) + r, y: h - r };
        velocity = { x: 0, y: -speed };
        break;
      case Direction.DOWN:
        position = { x: Math.random() * (w - 2 * r) + r, y: r };
        velocity = { x: 0, y: speed };
        break;
      case Direction.LEFT:
        position = { x: w - r, y: Math.random() * (h - 2 * r) + r };
        velocity = { x: -speed, y: 0 };
        break;
      case Direction.RIGHT:
        position = { x: r, y: Math.random() * (h - 2 * r) + r };
        velocity = { x: speed, y: 0 };
        break;
    }

    enemyBalls.value.push({
      id: enemyBallIdCounter++,
      position,
      velocity,
      radius: r,
      color,
      direction,
      isExploding: false,
    });
  }

  // ========== 检测球碰撞 ==========
  function checkBallCollision(ball1: Ball, ball2: Ball): boolean {
    const dx = ball1.position.x - ball2.position.x;
    const dy = ball1.position.y - ball2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.radius + ball2.radius;
  }

  // ========== 游戏失败 ==========
  function gameOver(): void {
    gameState.value = GameState.GAME_OVER;
    stopEnemySpawning();
    stopDifficultyIncrease();
  }

  // ========== 开始生成敌人 ==========
  function startEnemySpawning(): void {
    spawnTimer = window.setInterval(() => {
      if (gameState.value === GameState.PLAYING) {
        spawnEnemyBall();
      }
    }, currentSpawnRate.value);
  }

  // ========== 停止生成敌人 ==========
  function stopEnemySpawning(): void {
    if (spawnTimer !== null) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
  }

  // ========== 开始难度增加 ==========
  function startDifficultyIncrease(): void {
    difficultyTimer = window.setInterval(() => {
      // 减少敌人生成间隔
      currentSpawnRate.value = Math.max(
        ENEMY_BALL_CONFIG.MIN_SPAWN_INTERVAL,
        currentSpawnRate.value - ENEMY_BALL_CONFIG.SPAWN_RATE_DECREASE
      );

      // 重启生成计时器以应用新的生成率
      stopEnemySpawning();
      startEnemySpawning();
    }, ENEMY_BALL_CONFIG.DIFFICULTY_INCREASE_INTERVAL);
  }

  // ========== 停止难度增加 ==========
  function stopDifficultyIncrease(): void {
    if (difficultyTimer !== null) {
      clearInterval(difficultyTimer);
      difficultyTimer = null;
    }
  }

  // ========== 重新开始游戏 ==========
  function restartGame(): void {
    // 重置球位置
    ball.value.position = { x: screenWidth.value / 2, y: screenHeight.value / 2 };
    ballVelocity.value = { x: 0, y: 0 };

    // 清空敌人
    enemyBalls.value = [];

    // 清空粒子
    particles.value = [];

    // 重置生成间隔
    currentSpawnRate.value = ENEMY_BALL_CONFIG.SPAWN_INTERVAL;

    // 重置游戏状态
    gameState.value = GameState.PLAYING;

    // 开始生成敌人和难度增加
    startEnemySpawning();
    startDifficultyIncrease();
  }

  // ========== 更新球位置 ==========
  function updateBallPosition(): void {
    if (gameState.value !== GameState.PLAYING) return;

    const isMoving = ballVelocity.value.x !== 0 || ballVelocity.value.y !== 0;

    // 更新球位置
    ball.value.position.x += ballVelocity.value.x;
    ball.value.position.y += ballVelocity.value.y;

    // 如果在移动，创建尾迹粒子
    if (isMoving && Math.random() > 0.7) {
      createTrailParticles(ball.value.position, ballVelocity.value);
    }

    // 边界碰撞检测
    const { x, y } = ball.value.position;
    const r = ball.value.radius;
    const w = screenWidth.value;
    const h = screenHeight.value;

    let collided = false;
    let collisionPosition: Position | null = null;

    // 左边界
    if (x - r < 0) {
      ball.value.position.x = r;
      ballVelocity.value.x = -ballVelocity.value.x;
      collided = true;
      collisionPosition = { x: 0, y: y };
    }
    // 右边界
    if (x + r > w) {
      ball.value.position.x = w - r;
      ballVelocity.value.x = -ballVelocity.value.x;
      collided = true;
      collisionPosition = { x: w, y: y };
    }
    // 上边界
    if (y - r < 0) {
      ball.value.position.y = r;
      ballVelocity.value.y = -ballVelocity.value.y;
      collided = true;
      collisionPosition = { x: x, y: 0 };
    }
    // 下边界
    if (y + r > h) {
      ball.value.position.y = h - r;
      ballVelocity.value.y = -ballVelocity.value.y;
      collided = true;
      collisionPosition = { x: x, y: h };
    }

    // 如果碰撞，创建粒子效果
    if (collided && collisionPosition) {
      createCollisionParticles(collisionPosition, BALL_CONFIG.COLOR);
    }
  }

  // ========== 更新彩色小球 ==========
  function updateEnemyBalls(): void {
    const now = Date.now();
    const aliveEnemies: EnemyBall[] = [];

    for (const enemy of enemyBalls.value) {
      if (enemy.isExploding) {
        // 更新爆炸动画
        const elapsed = now - (enemy.explosionStartTime || 0);
        const progress = elapsed / PARTICLE_CONFIG.LIFETIME;

        if (progress >= 1) {
          // 爆炸结束，创建粒子
          createCollisionParticles(enemy.position, enemy.color);
          continue;
        }
        aliveEnemies.push(enemy);
        continue;
      }

      // 更新位置
      enemy.position.x += enemy.velocity.x;
      enemy.position.y += enemy.velocity.y;

      // 检测是否碰到边界
      const { x, y } = enemy.position;
      const r = enemy.radius;
      const w = screenWidth.value;
      const h = screenHeight.value;

      let hitBoundary = false;

      if (x - r < 0 || x + r > w || y - r < 0 || y + r > h) {
        hitBoundary = true;
      }

      if (hitBoundary) {
        enemy.isExploding = true;
        enemy.explosionStartTime = now;
      }

      // 检测是否碰到玩家
      if (checkBallCollision(ball.value, enemy)) {
        gameOver();
        return;
      }

      aliveEnemies.push(enemy);
    }

    enemyBalls.value = aliveEnemies;
  }

  // ========== 更新粒子 ==========
  function updateParticles(): void {
    const now = Date.now();
    const aliveParticles: Particle[] = [];

    for (const particle of particles.value) {
      const age = now - particle.birthTime;

      // 移除过期的粒子
      if (age > particle.lifetime) {
        continue;
      }

      // 更新位置
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;

      // 应用摩擦力
      particle.velocity.x *= PARTICLE_CONFIG.FRICTION;
      particle.velocity.y *= PARTICLE_CONFIG.FRICTION;

      aliveParticles.push(particle);
    }

    particles.value = aliveParticles;
  }

  // ========== 更新动画 ==========
  function updateAnimation(): void {
    // 脉冲动画
    animationState.value.pulse = (animationState.value.pulse + 0.05) % (Math.PI * 2);
    
    // 发光强度动画
    animationState.value.glowIntensity = 0.8 + Math.sin(animationState.value.pulse) * 0.2;
  }

  // ========== 游戏循环 ==========
  function startGameLoop(): void {
    // 开始生成敌人和难度增加
    startEnemySpawning();
    startDifficultyIncrease();

    gameLoopTimer = window.setInterval(() => {
      updateBallPosition();
      updateEnemyBalls();
      updateParticles();
    }, 16); // 约60FPS

    animationTimer = window.setInterval(() => {
      updateAnimation();
    }, 50); // 动画更新频率
  }

  function stopGameLoop(): void {
    if (gameLoopTimer !== null) {
      clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
    if (animationTimer !== null) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
    stopEnemySpawning();
    stopDifficultyIncrease();
  }

  // ========== 组件清理 ==========
  onUnmounted(() => {
    stopGameLoop();
  });

  return {
    // 状态
    ball,
    ballVelocity,
    particles,
    enemyBalls,
    animationState,
    gameState,
    // 方法
    moveBall,
    stopBall,
    startGameLoop,
    stopGameLoop,
    updateScreenSize,
    restartGame,
  };
}