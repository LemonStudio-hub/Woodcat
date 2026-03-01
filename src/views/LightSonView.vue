<template>
  <div class="light-son-view">
    <!-- 游戏容器 -->
    <div class="game-container" ref="gameContainer">
      <!-- 游戏画布 -->
      <div class="game-canvas" :style="canvasStyle">
        <!-- 玩家 -->
        <div
          v-if="gameState !== GameState.READY"
          class="player"
          :style="getPlayerStyle"
        ></div>

        <!-- 敌人 -->
        <div
          v-for="enemy in enemies"
          :key="enemy.id"
          class="enemy"
          :class="{ 'enemy--exploding': enemy.isExploding }"
          :style="getEnemyStyle(enemy)"
        ></div>

        <!-- 粒子 -->
        <div
          v-for="particle in particles"
          :key="particle.id"
          class="particle"
          :style="getParticleStyle(particle)"
        ></div>
      </div>

      <!-- 游戏UI -->
      <div class="game-ui">
        <!-- 统计信息 -->
        <div class="stats-panel">
          <div class="stat-item">
            <span class="stat-label">存活时间</span>
            <span class="stat-value">{{ survivalTimeFormatted }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">躲避敌人</span>
            <span class="stat-value">{{ gameStats.enemiesDodged }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">爆炸敌人</span>
            <span class="stat-value">{{ gameStats.enemiesExploded }}</span>
          </div>
        </div>

        <!-- 难度指示器 -->
        <div class="difficulty-indicator">
          <span class="difficulty-label">难度</span>
          <div class="difficulty-bar">
            <div class="difficulty-fill" :style="{ width: `${difficulty * 100}%` }"></div>
          </div>
        </div>

        <!-- 操作提示 -->
        <div class="controls-hint" v-if="gameState === GameState.PLAYING && !isMobile">
          <span>使用</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span>移动</span>
        </div>
      </div>

      <!-- 虚拟摇杆 -->
      <div
        v-if="gameState === GameState.PLAYING && isMobile"
        class="virtual-joystick"
        @touchstart="handleJoystickTouchStart"
        @touchmove="handleJoystickTouchMove"
        @touchend="handleJoystickTouchEnd"
        @touchcancel="handleJoystickTouchEnd"
      >
        <div class="joystick-base" ref="joystickBase">
          <div
            class="joystick-handle"
            :style="joystickHandleStyle"
          ></div>
        </div>
      </div>

      <!-- 开始界面 -->
      <div v-if="gameState === GameState.READY" class="overlay overlay--start">
        <div class="overlay-content">
          <div class="game-title">
            <div class="title-icon">✨</div>
            <h1 class="title-text">光之子</h1>
            <div class="title-subtitle">躲避敌人，存活下去</div>
          </div>
          <div class="game-instructions">
            <h3>游戏规则</h3>
            <ul>
              <li>操控发光的小球躲避彩色敌人</li>
              <li>敌人靠近时会爆炸，避开爆炸范围</li>
              <li>时间越久，敌人越多</li>
              <li>尽可能存活更长时间</li>
            </ul>
          </div>
          <button class="start-button" @click="startGame">
            开始游戏
          </button>
        </div>
      </div>

      <!-- 游戏结束界面 -->
      <div v-if="gameState === GameState.GAME_OVER" class="overlay overlay--gameover">
        <div class="overlay-content">
          <div class="game-over-icon">💥</div>
          <h2 class="game-over-title">游戏结束</h2>
          <div class="final-stats">
            <div class="final-stat">
              <span class="final-stat-label">存活时间</span>
              <span class="final-stat-value">{{ survivalTimeFormatted }}</span>
            </div>
            <div class="final-stat">
              <span class="final-stat-label">躲避敌人</span>
              <span class="final-stat-value">{{ gameStats.enemiesDodged }}</span>
            </div>
            <div class="final-stat">
              <span class="final-stat-label">爆炸敌人</span>
              <span class="final-stat-value">{{ gameStats.enemiesExploded }}</span>
            </div>
          </div>
          <div class="game-over-buttons">
            <button class="restart-button" @click="restartGame">
              再来一次
            </button>
            <button class="back-button" @click="goBack">
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 光之子游戏视图
 */

import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLightSonGame } from '@/composables/useLightSonGame';
import {
  GameState,
  PLAYER_CONFIG,
  ENEMY_CONFIG,
  GAME_CONFIG,
  JOYSTICK_CONFIG,
} from '@/constants/lightSonConstants';

const router = useRouter();

// 使用游戏逻辑
const {
  gameState,
  player,
  enemies,
  particles,
  gameStats,
  survivalTimeFormatted,
  difficulty,
  startGame,
  restartGame,
  handleKeyDown,
  handleKeyUp,
} = useLightSonGame();

// 移动设备检测
const isMobile = ref(false);
const joystickBase = ref<HTMLElement | null>(null);
const joystickPosition = ref({ x: 0, y: 0 });
const joystickActive = ref(false);

/**
 * 画布样式
 */
const canvasStyle = computed(() => {
  if (isMobile.value) {
    // 移动端：占满容器
    return {
      width: '100%',
      height: '100%',
    };
  }
  // 桌面端：固定尺寸
  return {
    width: `${GAME_CONFIG.SCREEN_WIDTH}px`,
    height: `${GAME_CONFIG.SCREEN_HEIGHT}px`,
  };
});

/**
 * 玩家样式
 */
const getPlayerStyle = computed(() => {
  return {
    left: `${player.value.position.x}px`,
    top: `${player.value.position.y}px`,
    width: `${player.value.radius * 2}px`,
    height: `${player.value.radius * 2}px`,
    backgroundColor: PLAYER_CONFIG.COLOR,
    boxShadow: `0 0 ${PLAYER_CONFIG.GLOW_SIZE}px ${PLAYER_CONFIG.GLOW_COLOR}`,
  };
});

/**
 * 敌人样式
 */
function getEnemyStyle(enemy: any) {
  const now = Date.now();
  let scale = 1;
  let opacity = 1;

  if (enemy.isExploding) {
    const elapsed = now - enemy.explosionStartTime;
    const progress = elapsed / ENEMY_CONFIG.EXPLOSION_DURATION;

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
    boxShadow: `0 0 ${enemy.radius}px ${enemy.color}`,
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

  return {
    left: `${particle.position.x - particle.size / 2}px`,
    top: `${particle.position.y - particle.size / 2}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    opacity: opacity,
  };
}

/**
 * 摇杆手柄样式
 */
const joystickHandleStyle = computed(() => {
  return {
    transform: `translate(${joystickPosition.value.x}px, ${joystickPosition.value.y}px)`,
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

  // 停止玩家移动
  player.value.isMovingUp = false;
  player.value.isMovingDown = false;
  player.value.isMovingLeft = false;
  player.value.isMovingRight = false;
}

/**
 * 更新摇杆位置
 */
function updateJoystick(event: TouchEvent): void {
  const touch = event.touches[0];
  if (!joystickBase.value) return;

  const rect = joystickBase.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;

  // 计算距离
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = JOYSTICK_CONFIG.MAX_DISTANCE;

  // 限制摇杆移动范围
  if (distance > maxDistance) {
    dx = (dx / distance) * maxDistance;
    dy = (dy / distance) * maxDistance;
  }

  // 检查死区
  if (distance < JOYSTICK_CONFIG.DEAD_ZONE) {
    dx = 0;
    dy = 0;
  }

  joystickPosition.value = { x: dx, y: dy };

  // 根据摇杆位置更新玩家移动状态
  player.value.isMovingUp = dy < -10;
  player.value.isMovingDown = dy > 10;
  player.value.isMovingLeft = dx < -10;
  player.value.isMovingRight = dx > 10;
}

/**
 * 处理键盘事件
 */
function onKeyDown(event: KeyboardEvent): void {
  if (gameState.value === GameState.PLAYING && !isMobile.value) {
    handleKeyDown(event.code);
  }
}

function onKeyUp(event: KeyboardEvent): void {
  if (gameState.value === GameState.PLAYING && !isMobile.value) {
    handleKeyUp(event.code);
  }
}

/**
 * 返回首页
 */
function goBack(): void {
  router.push('/');
}

/**
 * 组件挂载时添加事件监听
 */
onMounted(() => {
  checkMobile();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', checkMobile);
});

/**
 * 组件卸载时移除事件监听
 */
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
/**
 * 光之子游戏视图样式
 */

.light-son-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  padding: var(--spacing-2);
}

/* 游戏容器 */
.game-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
  max-width: 900px;
  height: 100vh;
  max-height: 800px;
}

/* 游戏画布 */
.game-canvas {
  position: relative;
  background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 200, 255, 0.2);
  flex: 1;
}

/* 玩家 */
.player {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  animation: playerPulse 2s ease-in-out infinite;
}

@keyframes playerPulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

/* 敌人 */
.enemy {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  transition: transform 0.1s ease-out;
}

.enemy--exploding {
  z-index: 15;
}

/* 粒子 */
.particle {
  position: absolute;
  border-radius: 50%;
  z-index: 20;
  transition: opacity 0.05s ease-out;
}

/* 游戏UI */
.game-ui {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 200, 255, 0.2);
  border-radius: var(--radius-lg);
}

/* 统计面板 */
.stats-panel {
  display: flex;
  justify-content: space-around;
  gap: var(--spacing-2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-white);
  text-shadow: 0 0 10px rgba(100, 200, 255, 0.5);
}

/* 难度指示器 */
.difficulty-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.difficulty-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-400);
  font-weight: 600;
}

.difficulty-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.difficulty-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff 0%, #ff4444 100%);
  transition: width 0.3s ease;
}

/* 操作提示 */
.controls-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-gray-400);
}

.controls-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 var(--spacing-1);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: inherit;
  font-size: var(--font-size-xs);
  color: var(--color-white);
  font-weight: 600;
}

/* 虚拟摇杆 */
.virtual-joystick {
  position: fixed;
  bottom: var(--spacing-8);
  left: 50%;
  transform: translateX(-50%);
  width: JOYSTICK_CONFIG.RADIUS * 2;
  height: JOYSTICK_CONFIG.RADIUS * 2;
  z-index: 50;
  touch-action: none;
}

.joystick-base {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.joystick-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: JOYSTICK_CONFIG.HANDLE_RADIUS * 2;
  height: JOYSTICK_CONFIG.HANDLE_RADIUS * 2;
  margin-top: -JOYSTICK_CONFIG.HANDLE_RADIUS;
  margin-left: -JOYSTICK_CONFIG.HANDLE_RADIUS;
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
  transition: transform 0.05s ease-out;
}

/* 遮罩层 */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
  z-index: 100;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(100, 200, 255, 0.3);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: 0 0 60px rgba(0, 200, 255, 0.3);
  animation: slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  max-width: 90%;
}

@keyframes slideIn {
  from {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* 开始界面 */
.game-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
}

.title-icon {
  font-size: 4rem;
  animation: iconFloat 2s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.title-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 200, 255, 0.5);
}

.title-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-gray-400);
  font-weight: 600;
}

/* 游戏说明 */
.game-instructions {
  width: 100%;
  max-width: 400px;
  text-align: left;
}

.game-instructions h3 {
  font-size: var(--font-size-lg);
  color: var(--color-white);
  margin-bottom: var(--spacing-3);
  text-align: center;
}

.game-instructions ul {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-left: var(--spacing-4);
}

.game-instructions li {
  font-size: var(--font-size-sm);
  color: var(--color-gray-300);
  line-height: 1.6;
}

/* 开始按钮 */
.start-button {
  padding: var(--spacing-4) var(--spacing-8);
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
  color: var(--color-black);
  font-size: var(--font-size-lg);
  font-weight: 700;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.start-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.start-button:hover::before {
  opacity: 1;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.7);
}

.start-button:active {
  transform: translateY(0);
}

/* 游戏结束界面 */
.game-over-icon {
  font-size: 4rem;
  animation: explode 0.5s ease-out;
}

@keyframes explode {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.game-over-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-white);
  text-shadow: 0 0 20px rgba(255, 100, 100, 0.5);
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
  width: 100%;
}

.final-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
}

.final-stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.final-stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-white);
}

/* 游戏结束按钮 */
.game-over-buttons {
  display: flex;
  gap: var(--spacing-3);
  width: 100%;
}

.restart-button,
.back-button {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.restart-button {
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
  color: var(--color-black);
}

.restart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .game-container {
    padding: 0;
    max-height: 100vh;
    height: 100vh;
  }

  .game-ui {
    padding: var(--spacing-2);
    gap: var(--spacing-1);
  }

  .stats-panel {
    flex-direction: row;
    gap: var(--spacing-1);
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .difficulty-indicator {
    display: none;
  }

  .final-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }

  .game-over-buttons {
    flex-direction: column;
  }

  .virtual-joystick {
    bottom: var(--spacing-4);
  }

  .overlay-content {
    padding: var(--spacing-6);
    width: 95%;
  }

  .title-text {
    font-size: 2rem;
  }

  .title-icon {
    font-size: 3rem;
  }
}
</style>