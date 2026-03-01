/**
 * 光球游戏逻辑
 */

import { ref, onUnmounted } from 'vue';
import {
  BALL_CONFIG,
  GAME_CONFIG,
  PARTICLE_CONFIG,
  type Ball,
  type Particle,
  type Position,
} from '@/constants/lightBallConstants';

export function useLightBallGame() {
  // ========== 球状态 ==========
  const ball = ref<Ball>({
    position: { x: GAME_CONFIG.SCREEN_WIDTH / 2, y: GAME_CONFIG.SCREEN_HEIGHT / 2 },
    radius: BALL_CONFIG.RADIUS,
  });

  // 球的速度
  const ballVelocity = ref<Position>({ x: 0, y: 0 });

  // 粒子列表
  const particles = ref<Particle[]>([]);

  // 粒子ID计数器
  let particleIdCounter = 0;

// ========== 屏幕尺寸 ==========
  const screenWidth = ref<number>(GAME_CONFIG.SCREEN_WIDTH);
  const screenHeight = ref<number>(GAME_CONFIG.SCREEN_HEIGHT);

  // ========== 更新屏幕尺寸 ==========
  function updateScreenSize(width: number, height: number): void {
    screenWidth.value = width;
    screenHeight.value = height;
    
    // 确保球在新的边界内
    ball.value.position.x = Math.max(ball.value.radius, Math.min(width - ball.value.radius, ball.value.position.x));
    ball.value.position.y = Math.max(ball.value.radius, Math.min(height - ball.value.radius, ball.value.position.y));
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

  // ========== 更新球位置 ==========
  function updateBallPosition(): void {
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
    gameLoopTimer = window.setInterval(() => {
      updateBallPosition();
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
    animationState,
    // 方法
    moveBall,
    stopBall,
    startGameLoop,
    stopGameLoop,
    updateScreenSize,
  };
}