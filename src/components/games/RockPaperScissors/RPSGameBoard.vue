<template>
  <div class="game-board">
    <div class="game-info">
      <h2 class="game-title">石头 剪刀 布</h2>
      <p class="game-subtitle">选择你的出招</p>
    </div>

    <div class="choices-container">
      <button
        v-for="choice in choices"
        :key="choice.value"
        class="choice-button"
        :class="{ 
          'choice-button--active': isSelected(choice.value),
          'choice-button--shaking': isPlaying && isSelected(choice.value)
        }"
        @click="handleChoice(choice.value)"
        :disabled="isPlaying"
      >
        <span class="choice-label">{{ choice.label }}</span>
      </button>
    </div>

    <div v-if="currentResult" class="result-section">
      <div class="result-display">
        <span class="result-text" :class="`result-text--${currentResult}`">{{ resultText() }}</span>
      </div>
      <div class="choices-comparison">
        <div class="comparison-item" :class="`comparison-item--${currentResult === 'win' ? 'winner' : currentResult === 'lose' ? 'loser' : ''}`">
          <span class="comparison-label">你</span>
          <span class="comparison-choice" :class="`comparison-choice--reveal`">{{ choiceLabel(playerChoice) }}</span>
        </div>
        <span class="vs-text">VS</span>
        <div class="comparison-item" :class="`comparison-item--${currentResult === 'lose' ? 'winner' : currentResult === 'win' ? 'loser' : ''}`">
          <span class="comparison-label">电脑</span>
          <span class="comparison-choice" :class="`comparison-choice--reveal`">{{ choiceLabel(computerChoice) }}</span>
        </div>
      </div>
      <p class="auto-reset-hint">{{ countdownText }}</p>
      <button class="play-again-button" @click="handlePlayAgain">
        立即开始
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 石头剪刀布游戏面板组件
 * 显示游戏选项和结果
 */

import { ref, watch, onUnmounted } from 'vue';
import { RPSChoice } from '@/types/game';
import { RPS_CHOICE_MAP, RPS_RESULT_MAP } from '@/constants/gameConstants';

// 定义 Props
interface Props {
  isPlaying: boolean;
  playerChoice: RPSChoice | null;
  computerChoice: RPSChoice | null;
  currentResult: 'win' | 'lose' | 'draw' | null;
}

const props = defineProps<Props>();

// 定义 Emits
interface Emits {
  (e: 'play', choice: RPSChoice): void;
  (e: 'play-again'): void;
}

const emit = defineEmits<Emits>();

// 倒计时相关
const AUTO_RESET_DELAY = 2000; // 2秒后自动重置
const countdown = ref<number>(0);
let countdownTimer: number | null = null;

// 倒计时文本
const countdownText = ref<string>('自动进入下一局...');

/**
 * 启动倒计时
 */
function startCountdown(): void {
  let remaining = Math.ceil(AUTO_RESET_DELAY / 1000);
  countdown.value = remaining;
  
  countdownTimer = window.setInterval(() => {
    remaining--;
    countdown.value = remaining;
    
    if (remaining <= 0) {
      stopCountdown();
    }
  }, 1000);
}

/**
 * 停止倒计时
 */
function stopCountdown(): void {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdown.value = 0;
}

// 监听游戏结果变化
watch(() => props.currentResult, (newResult) => {
  if (newResult !== null) {
    startCountdown();
  } else {
    stopCountdown();
  }
});

// 监听倒计时变化，更新提示文本
watch(countdown, (value) => {
  if (value > 0) {
    countdownText.value = `${value}秒后自动进入下一局`;
  } else {
    countdownText.value = '即将开始新局...';
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCountdown();
});

// 游戏选项列表
const choices = [
  { value: RPSChoice.ROCK, ...RPS_CHOICE_MAP.rock },
  { value: RPSChoice.PAPER, ...RPS_CHOICE_MAP.paper },
  { value: RPSChoice.SCISSORS, ...RPS_CHOICE_MAP.scissors },
];

/**
 * 判断选项是否被选中
 */
function isSelected(choice: RPSChoice): boolean {
  return props.playerChoice === choice;
}

/**
 * 处理选项点击
 */
function handleChoice(choice: RPSChoice): void {
  if (!props.isPlaying && !props.currentResult) {
    emit('play', choice);
  }
}

/**
 * 获取结果文本
 */
function resultText(): string {
  if (!props.currentResult) return '';
  const result = RPS_RESULT_MAP[props.currentResult];
  return result?.label || '';
}

/**
 * 获取选项标签
 */
function choiceLabel(choice: RPSChoice | null): string {
  if (!choice) return '';
  const choiceData = RPS_CHOICE_MAP[choice as keyof typeof RPS_CHOICE_MAP];
  return choiceData?.label || '';
}

/**
 * 处理再玩一次按钮点击
 */
function handlePlayAgain(): void {
  emit('play-again');
}
</script>

<style scoped>
/**
 * 游戏面板组件样式
 */

.game-board {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-8);
  min-height: 400px;
  transition: all var(--transition-slow);
}

/* 游戏信息 */
.game-info {
  text-align: center;
}

.game-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--color-black);
  margin-bottom: var(--spacing-2);
  letter-spacing: 0.05em;
}

.game-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-gray-500);
}

/* 选项容器 */
.choices-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
  max-width: 600px;
  margin: 0 auto;
}

/* 选项按钮 */
.choice-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-6) var(--spacing-4);
  background-color: var(--color-white);
  border: var(--border-width-medium) solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.choice-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.choice-button:active::before {
  width: 200%;
  height: 200%;
}

.choice-button:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  border-color: var(--color-black);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.choice-button--active {
  background-color: var(--color-black);
  border-color: var(--color-black);
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.choice-button--shaking {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px) rotate(-5deg);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px) rotate(5deg);
  }
}

.choice-button--active .choice-label {
  color: var(--color-white);
}

.choice-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-black);
}

/* 结果区域 */
.result-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  min-height: 200px;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
}

.result-text {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-black);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.result-text--win {
  color: var(--color-green-600);
}

.result-text--lose {
  color: var(--color-red-600);
}

.result-text--draw {
  color: var(--color-gray-600);
}

/* 选项对比 */
.choices-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-6);
}

.comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.comparison-item--winner {
  background-color: rgba(34, 197, 94, 0.1);
  transform: scale(1.05);
  animation: winnerPulse 0.5s ease-out;
}

@keyframes winnerPulse {
  0%, 100% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.15);
  }
}

.comparison-item--loser {
  background-color: rgba(239, 68, 68, 0.1);
  transform: scale(0.95);
  opacity: 0.7;
}

.comparison-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 600;
}

.comparison-choice {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-black);
}

.comparison-choice--reveal {
  animation: flipIn 0.4s ease-out;
}

@keyframes flipIn {
  0% {
    opacity: 0;
    transform: rotateY(90deg) scale(0.5);
  }
  50% {
    transform: rotateY(45deg) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: rotateY(0) scale(1);
  }
}

.vs-text {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-gray-400);
}

/* 再玩一次按钮 */
.play-again-button {
  align-self: center;
  padding: var(--spacing-3) var(--spacing-8);
  background-color: var(--color-black);
  color: var(--color-white);
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.play-again-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.play-again-button:hover::before {
  left: 100%;
}

.play-again-button:hover {
  background-color: var(--color-gray-800);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.play-again-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 倒计时提示 */
.auto-reset-hint {
  align-self: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 500;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-board {
    padding: var(--spacing-4);
    gap: var(--spacing-5);
    min-height: 350px;
  }

  .game-title {
    font-size: var(--font-size-2xl);
  }

  .choices-container {
    gap: var(--spacing-3);
    max-width: 100%;
  }

  .choice-button {
    padding: var(--spacing-5) var(--spacing-3);
  }

  .choice-label {
    font-size: var(--font-size-sm);
  }

  .result-section {
    padding: var(--spacing-5);
    gap: var(--spacing-4);
    min-height: 180px;
  }

  .result-display {
    gap: var(--spacing-2);
  }

  .result-text {
    font-size: var(--font-size-lg);
  }

  .choices-comparison {
    gap: var(--spacing-4);
  }

  .play-again-button {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-sm);
  }

  .auto-reset-hint {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .game-board {
    padding: var(--spacing-3);
    gap: var(--spacing-4);
    min-height: 300px;
  }

  .game-title {
    font-size: var(--font-size-xl);
  }

  .game-subtitle {
    font-size: var(--font-size-sm);
  }

  .choices-container {
    gap: var(--spacing-2);
  }

  .choice-button {
    padding: var(--spacing-4) var(--spacing-2);
  }

  .choice-label {
    font-size: var(--font-size-xs);
  }

  .result-section {
    padding: var(--spacing-4);
    gap: var(--spacing-3);
    min-height: 150px;
  }

  .result-text {
    font-size: var(--font-size-base);
  }

  .comparison-choice {
    font-size: var(--font-size-base);
  }

  .vs-text {
    font-size: var(--font-size-base);
  }
}
</style>