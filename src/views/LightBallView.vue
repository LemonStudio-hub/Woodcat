<template>
  <div class="light-ball-view">
    <!-- 游戏容器 -->
    <div class="game-container" ref="gameContainer">
      <!-- 游戏画布 -->
      <div class="game-canvas" :style="canvasStyle">
        <!-- 球 -->
        <div
          class="ball"
          :style="getBallStyle"
        ></div>

        <!-- 彩色小球 -->
        <div
          v-for="enemy in enemyBalls"
          :key="enemy.id"
          class="enemy-ball"
          :class="{ 'enemy-ball--exploding': enemy.isExploding }"
          :style="getEnemyBallStyle(enemy)"
        ></div>

        <!-- 粒子 -->
        <div
          v-for="particle in particles"
          :key="particle.id"
          class="particle"
          :style="getParticleStyle(particle)"
        ></div>
      </div>

      <!-- 退出按钮 -->
      <button class="exit-button" @click="goBack">
        ✕
      </button>

      <!-- 虚拟摇杆 -->
      <div
        v-if="gameState === GameState.PLAYING"
        class="virtual-joystick"
        @touchstart="handleJoystickTouchStart"
        @touchmove="handleJoystickTouchMove"
        @touchend="handleJoystickTouchEnd"
        @touchcancel="handleJoystickTouchEnd"
        ref="joystickContainer"
      >
        <div
          class="joystick-base"
          ref="joystickBase"
          :style="joystickBaseStyle"
        >
          <div
            class="joystick-handle"
            :style="joystickHandleStyle"
          ></div>
        </div>
      </div>
    </div>

    <!-- 游戏结束遮罩 -->
    <div v-if="gameState === GameState.GAME_OVER" class="game-over-overlay">
      <div class="game-over-content">
        <div class="game-over-icon">💥</div>
        <div class="game-over-title">游戏结束</div>
        <div class="game-over-buttons">
          <button class="restart-button" @click="handleRestart">
            重新开始
          </button>
          <button class="back-button" @click="goBack">
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 光球游戏视图
 */

import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLightBallGame } from '@/composables/useLightBallGame';
import {
  BALL_CONFIG,
  GAME_CONFIG,
  JOYSTICK_CONFIG,
  GameState,
} from '@/constants/lightBallConstants';

const router = useRouter();

// 使用游戏逻辑
const {
  ball,
  ballVelocity,
  particles,
  enemyBalls,
  animationState,
  gameState,
  moveBall,
  stopBall,
  startGameLoop,
  stopGameLoop,
  updateScreenSize,
  restartGame,
} = useLightBallGame();

// 移动设备检测
const isMobile = ref(false);
const joystickBase = ref<HTMLElement | null>(null);
const joystickPosition = ref({ x: 0, y: 0 });
const joystickActive = ref(false);
const joystickCenter = ref({ x: 0, y: 0 });
const joystickScreenPosition = ref({ x: 0, y: 0 });

// 容器引用
const gameContainer = ref<HTMLElement | null>(null);
const joystickContainer = ref<HTMLElement | null>(null);

// 全屏控制
const isFullscreen = ref(false);

/**
 * 进入全屏
 */
function enterFullscreen(): void {
  try {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  } catch (error) {
    console.error('Fullscreen not supported:', error);
  }
}

/**
 * 退出全屏
 */
function exitFullscreen(): void {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  } catch (error) {
    console.error('Exit fullscreen error:', error);
  }
}

/**
 * 检测全屏状态
 */
function checkFullscreen(): void {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * 禁用滚动
 */
function disableScroll(): void {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
}

/**
 * 启用滚动
 */
function enableScroll(): void {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
}

/**
 * 隐藏导航栏
 */
function hideNavigation(): void {
  const header = document.querySelector('.header');
  if (header) {
    (header as HTMLElement).style.display = 'none';
  }
}

/**
 * 显示导航栏
 */
function showNavigation(): void {
  const header = document.querySelector('.header');
  if (header) {
    (header as HTMLElement).style.display = '';
  }
}

/**
 * 画布样式
 */
const canvasStyle = computed(() => {
  if (isMobile.value) {
    return {
      width: '100%',
      height: '100%',
    };
  }
  return {
    width: `${GAME_CONFIG.SCREEN_WIDTH}px`,
    height: `${GAME_CONFIG.SCREEN_HEIGHT}px`,
  };
});

/**
 * 球样式
 */
const getBallStyle = computed(() => {
  const pulseScale = 1 + Math.sin(animationState.value.pulse) * 0.08;
  const glowSize = BALL_CONFIG.GLOW_SIZE * (0.8 + animationState.value.glowIntensity * 0.4);
  const isMoving = ballVelocity.value.x !== 0 || ballVelocity.value.y !== 0;
  
  return {
    left: `${ball.value.position.x}px`,
    top: `${ball.value.position.y}px`,
    width: `${ball.value.radius * 2}px`,
    height: `${ball.value.radius * 2}px`,
    backgroundColor: BALL_CONFIG.COLOR,
    boxShadow: `
      0 0 ${glowSize}px ${BALL_CONFIG.GLOW_COLOR},
      0 0 ${glowSize * 0.5}px rgba(255, 255, 255, 0.4),
      inset 0 0 ${BALL_CONFIG.RADIUS}px rgba(255, 255, 255, 0.2)
    `,
    transform: `scale(${pulseScale})`,
    transition: isMoving ? 'none' : 'transform 0.3s ease-out',
  };
});

/**
 * 彩色小球样式
 */
function getEnemyBallStyle(enemy: any) {
  const now = Date.now();
  let scale = 1;
  let opacity = 1;

  if (enemy.isExploding) {
    const elapsed = now - (enemy.explosionStartTime || 0);
    const progress = elapsed / 1000; // 1秒爆炸动画

    if (progress < 1) {
      // 爆炸动画：先放大后消失
      scale = 1 + progress * 3; // 放大到4倍
      opacity = 1 - progress; // 渐变透明
    }
  }

  return {
    left: `${enemy.position.x - enemy.radius}px`,
    top: `${enemy.position.y - enemy.radius}px`,
    width: `${enemy.radius * 2}px`,
    height: `${enemy.radius * 2}px`,
    backgroundColor: enemy.color,
    boxShadow: `0 0 ${enemy.radius * 2}px ${enemy.color}`,
    transform: `scale(${scale})`,
    opacity: opacity,
  };
}

/**
 * 粒子样式
 */
function getParticleStyle(particle: any) {
  const now = Date.now();
  const age = now - particle.birthTime;
  const progress = age / particle.lifetime;
  const opacity = 1 - progress;
  const scale = 1 - progress * 0.6;

  return {
    left: `${particle.position.x - particle.size / 2}px`,
    top: `${particle.position.y - particle.size / 2}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    opacity: opacity,
    transform: `scale(${scale})`,
    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
  };
}

/**
 * 摇杆手柄样式
 */
const joystickHandleStyle = computed(() => {
  return {
    transform: `translate(${joystickPosition.value.x}px, ${joystickPosition.value.y}px) translateZ(0)`,
  };
});

/**
 * 摇杆底座样式
 */
const joystickBaseStyle = computed(() => {
  if (!joystickActive.value) {
    return {
      display: 'none',
    };
  }
  return {
    left: `${joystickScreenPosition.value.x}px`,
    top: `${joystickScreenPosition.value.y}px`,
  };
});

/**
 * 检测移动设备
 */
function checkMobile(): void {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

/**
 * 处理摇杆触摸开始
 */
function handleJoystickTouchStart(event: TouchEvent): void {
  event.preventDefault();
  joystickActive.value = true;

  const touch = event.touches[0];
  
  joystickScreenPosition.value = {
    x: touch.clientX - JOYSTICK_CONFIG.RADIUS,
    y: touch.clientY - JOYSTICK_CONFIG.RADIUS,
  };
  joystickCenter.value = {
    x: touch.clientX,
    y: touch.clientY,
  };

  updateJoystick(event);
}

/**
 * 处理摇杆触摸移动
 */
function handleJoystickTouchMove(event: TouchEvent): void {
  event.preventDefault();
  if (!joystickActive.value) return;
  updateJoystick(event);
}

/**
 * 处理摇杆触摸结束
 */
function handleJoystickTouchEnd(event: TouchEvent): void {
  event.preventDefault();
  joystickActive.value = false;
  joystickPosition.value = { x: 0, y: 0 };
  stopBall();
}

/**
 * 处理重新开始游戏
 */
function handleRestart(): void {
  restartGame();
}

/**
 * 处理返回首页
 */
function goBack(): void {
  router.push('/');
}

/**
 * 更新摇杆位置
 */
function updateJoystick(event: TouchEvent): void {
  const touch = event.touches[0];

  let dx = touch.clientX - joystickCenter.value.x;
  let dy = touch.clientY - joystickCenter.value.y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = JOYSTICK_CONFIG.MAX_DISTANCE;

  if (distance > maxDistance) {
    dx = (dx / distance) * maxDistance;
    dy = (dy / distance) * maxDistance;
  }

  if (distance < JOYSTICK_CONFIG.DEAD_ZONE) {
    dx = 0;
    dy = 0;
  }

  joystickPosition.value = { x: dx, y: dy };

  // 移动球
  moveBall(dx, dy);
}

/**
 * 组件挂载时添加事件监听
 */
onMounted(() => {
  checkMobile();
  
  // 更新屏幕尺寸
  const width = isMobile.value ? window.innerWidth : GAME_CONFIG.SCREEN_WIDTH;
  const height = isMobile.value ? window.innerHeight : GAME_CONFIG.SCREEN_HEIGHT;
  updateScreenSize(width, height);
  
  startGameLoop();
  
  enterFullscreen();
  disableScroll();
  hideNavigation();

  document.addEventListener('fullscreenchange', checkFullscreen);
  document.addEventListener('webkitfullscreenchange', checkFullscreen);
  document.addEventListener('mozfullscreenchange', checkFullscreen);
  document.addEventListener('MSFullscreenChange', checkFullscreen);
  
  window.addEventListener('resize', checkMobile);
});

/**
 * 组件卸载时移除事件监听
 */
onUnmounted(() => {
  stopGameLoop();
  
  document.removeEventListener('fullscreenchange', checkFullscreen);
  document.removeEventListener('webkitfullscreenchange', checkFullscreen);
  document.removeEventListener('mozfullscreenchange', checkFullscreen);
  document.removeEventListener('MSFullscreenChange', checkFullscreen);
  
  window.removeEventListener('resize', checkMobile);
  
  enableScroll();
  showNavigation();
  exitFullscreen();
});
</script>

<style scoped>
/**
 * 光球游戏视图样式
 */

.light-ball-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #000000;
  padding: var(--spacing-2);
}

/* 游戏容器 */
.game-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  height: 100vh;
  max-height: 800px;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 游戏画布 */
.game-canvas {
  position: relative;
  background: #000000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 球 */
.ball {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%) translateZ(0);
  z-index: 10;
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 粒子 */
.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 彩色小球 */
.enemy-ball {
  position: absolute;
  border-radius: 50%;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.enemy-ball--exploding {
  animation: enemyExplosion 1s ease-out forwards;
}

@keyframes enemyExplosion {
  0% {
    transform: translateZ(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateZ(0) scale(2.5);
    opacity: 0.8;
  }
  100% {
    transform: translateZ(0) scale(4);
    opacity: 0;
  }
}

/* 游戏结束遮罩 */
.game-over-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.3s ease;
  z-index: 100;
  backdrop-filter: blur(5px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: var(--radius-xl);
  text-align: center;
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-over-icon {
  font-size: 4rem;
  animation: iconPulse 0.6s ease-in-out infinite alternate;
}

@keyframes iconPulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.2);
  }
}

.game-over-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-white);
  animation: titleSlideIn 0.4s ease-out 0.2s both;
}

@keyframes titleSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.game-over-buttons {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  justify-content: center;
}

.restart-button,
.back-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.restart-button:hover,
.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateZ(0) translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.back-button {
  background-color: rgba(255, 255, 255, 0.05);
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

@keyframes ballPulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

/* 退出按钮 */
.exit-button {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: var(--font-size-lg);
  color: var(--color-white);
  cursor: pointer;
  transition: transform var(--transition-fast), background-color var(--transition-fast);
  z-index: 60;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.exit-button:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 100, 100, 0.5);
  transform: translateZ(0) rotate(90deg);
}

.exit-button:active {
  transform: translateZ(0) rotate(90deg) scale(0.9);
}

/* 虚拟摇杆 */
.virtual-joystick {
  position: fixed;
  inset: 0;
  z-index: 50;
  touch-action: none;
}

.joystick-base {
  position: absolute;
  width: JOYSTICK_CONFIG.RADIUS * 2;
  height: JOYSTICK_CONFIG.RADIUS * 2;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transform: translate(-50%, -50%) translateZ(0);
  transition: opacity 0.2s ease;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

.joystick-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: JOYSTICK_CONFIG.HANDLE_RADIUS * 2;
  height: JOYSTICK_CONFIG.HANDLE_RADIUS * 2;
  margin-top: -JOYSTICK_CONFIG.HANDLE_RADIUS;
  margin-left: -JOYSTICK_CONFIG.HANDLE_RADIUS;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transition: transform 0.05s ease-out;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .game-container {
    padding: 0;
    max-height: 100vh;
    height: 100vh;
  }

  .game-canvas {
    border-radius: 0;
  }
}
</style>