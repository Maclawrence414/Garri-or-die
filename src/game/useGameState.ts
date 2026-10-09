/**
 * Game State Management Hook & Core Gameplay Mechanics
 * Handles the Spoon Delivery Timing Meter, Hunger Decay, 3-Miss Strike Loop,
 * Combo Multipliers, Level Progression, and High Scores.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';
import { SceneConfig } from './three/GameScene';

export interface GameState {
  score: number;
  highScore: number;
  level: number;
  missCount: number; // 0, 1, 2, 3 (3 = GAME OVER)
  maxMisses: number;
  hunger: number; // 0 to 100
  combo: number;
  maxCombo: number;
  spoonsEaten: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  gameOverReason: 'misses' | 'starvation' | null;
  meterPosition: number; // 0 to 100 (needle position)
  sweetSpotStart: number; // e.g. 40
  sweetSpotEnd: number; // e.g. 60
  perfectSpotStart: number; // e.g. 47
  perfectSpotEnd: number; // e.g. 53
  activeQuip: string;
  quipType: 'hit' | 'miss' | 'idle' | 'combo' | 'gameover';
  flyActive: boolean;
  flyX: number;
  flyY: number;
}

export function useGameState(sceneConfig: SceneConfig) {
  const [state, setState] = useState<GameState>(() => {
    const savedHighScore = localStorage.getItem('garri_high_score');
    return {
      score: 0,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
      level: 1,
      missCount: 0,
      maxMisses: 3,
      hunger: 100,
      combo: 0,
      maxCombo: 0,
      spoonsEaten: 0,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      gameOverReason: null,
      meterPosition: 50,
      sweetSpotStart: 35,
      sweetSpotEnd: 65,
      perfectSpotStart: 45,
      perfectSpotEnd: 55,
      activeQuip: "Press START to feed your hungry self!",
      quipType: 'idle',
      flyActive: false,
      flyX: 50,
      flyY: 50,
    };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const needleDirRef = useRef<number>(1);
  const needleSpeedRef = useRef<number>(100); // units per second
  const lastTimeRef = useRef<number>(0);
  const reqAnimRef = useRef<number | null>(null);
  const feedCooldownRef = useRef<boolean>(false);

  // Callbacks hooked into 3D scene
  const onSceneFeed = useRef<((isSuccess: boolean) => void) | null>(null);
  const onSceneGameOver = useRef<(() => void) | null>(null);
  const onSceneReset = useRef<(() => void) | null>(null);
  const onSceneMouthUpdate = useRef<((open: number) => void) | null>(null);

  // Calculate meter sweet-spot based on level
  const updateLevelParameters = useCallback((level: number) => {
    // With higher levels, needle gets faster and sweet spot slightly tighter
    const baseSpeed = 95 + level * 28;
    needleSpeedRef.current = Math.min(baseSpeed, 260);

    const sweetWidth = Math.max(16, 32 - level * 2.2);
    const perfectWidth = Math.max(7, 13 - level * 0.9);

    const center = 50;
    setState(prev => ({
      ...prev,
      sweetSpotStart: center - sweetWidth / 2,
      sweetSpotEnd: center + sweetWidth / 2,
      perfectSpotStart: center - perfectWidth / 2,
      perfectSpotEnd: center + perfectWidth / 2,
      flyActive: level >= 3,
    }));
  }, []);

  // Trigger Game Over
  const handleGameOver = useCallback((reason: 'misses' | 'starvation') => {
    soundManager.stopAfrobeatMusic();
    soundManager.playGameOver();
    const finalQuip = soundManager.getRandomQuip('gameOver');
    soundManager.speak(finalQuip);

    if (onSceneGameOver.current) {
      onSceneGameOver.current();
    }

    setState(prev => {
      const isNewHigh = prev.score > prev.highScore;
      const newHigh = Math.max(prev.score, prev.highScore);
      if (isNewHigh) {
        localStorage.setItem('garri_high_score', newHigh.toString());
      }
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        gameOverReason: reason,
        highScore: newHigh,
        activeQuip: finalQuip,
        quipType: 'gameover',
      };
    });
  }, []);

  // Main Loop for Meter oscillation & hunger decay
  useEffect(() => {
    if (!state.isPlaying || state.isPaused || state.isGameOver) return;

    let flyTimer = 0;

    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // 1. Move Meter Needle
      let pos = stateRef.current.meterPosition + needleDirRef.current * needleSpeedRef.current * dt;
      if (pos >= 100) {
        pos = 100;
        needleDirRef.current = -1;
      } else if (pos <= 0) {
        pos = 0;
        needleDirRef.current = 1;
      }

      // 2. Map needle proximity to character mouth opening!
      // When needle is in sweet-spot, character's mouth opens wide in anticipation!
      const distFromCenter = Math.abs(pos - 50);
      const mouthOpenness = Math.max(0.1, 1.0 - distFromCenter / 35);
      if (onSceneMouthUpdate.current) {
        onSceneMouthUpdate.current(mouthOpenness);
      }

      // 3. Hunger Decay
      // Ice block slows hunger decay by 25%
      const iceModifier = sceneConfig.toppings.ice ? 0.75 : 1.0;
      const baseHungerDecay = (3.2 + stateRef.current.level * 0.9) * iceModifier;
      const newHunger = Math.max(0, stateRef.current.hunger - baseHungerDecay * dt);

      // 4. Housefly wandering (Level 3+)
      flyTimer += dt;
      const flyX = 50 + Math.sin(flyTimer * 4) * 35;
      const flyY = 45 + Math.cos(flyTimer * 6) * 20;

      // Check starvation
      if (newHunger <= 0) {
        handleGameOver('starvation');
        return;
      }

      setState(prev => ({
        ...prev,
        meterPosition: pos,
        hunger: newHunger,
        flyX,
        flyY,
      }));

      reqAnimRef.current = requestAnimationFrame(tick);
    };

    reqAnimRef.current = requestAnimationFrame(tick);

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      lastTimeRef.current = 0;
    };
  }, [state.isPlaying, state.isPaused, state.isGameOver, handleGameOver, sceneConfig.toppings.ice]);

  // Feed action (User clicks, taps, or hits spacebar)
  const feed = useCallback(() => {
    if (!state.isPlaying || state.isPaused || state.isGameOver || feedCooldownRef.current) return;

    feedCooldownRef.current = true;
    setTimeout(() => {
      feedCooldownRef.current = false;
    }, 400); // brief debounce for spoon animation

    const pos = stateRef.current.meterPosition;
    const isPerfect = pos >= stateRef.current.perfectSpotStart && pos <= stateRef.current.perfectSpotEnd;
    const isGood = pos >= stateRef.current.sweetSpotStart && pos <= stateRef.current.sweetSpotEnd;

    if (isPerfect || isGood) {
      // SUCCESSFUL SPOONFUL!
      soundManager.playChomp();

      if (onSceneFeed.current) {
        onSceneFeed.current(true);
      }

      const comboMultiplier = stateRef.current.combo >= 4 ? 3 : stateRef.current.combo >= 2 ? 2 : 1;
      const groundnutBonus = sceneConfig.toppings.groundnuts ? 1.5 : 1.0;
      const basePoints = isPerfect ? 250 : 120;
      const earnedPoints = Math.round(basePoints * comboMultiplier * groundnutBonus);

      // Hunger boost: Milk & sugar boosts by +38%, normal +28%
      const hungerBoost = sceneConfig.toppings.milk ? 38 : 28;
      const newHunger = Math.min(100, stateRef.current.hunger + hungerBoost);

      const newCombo = stateRef.current.combo + 1;
      const newSpoons = stateRef.current.spoonsEaten + 1;
      const newScore = stateRef.current.score + earnedPoints;

      // Celebrate high combo
      if (newCombo % 5 === 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#facc15', '#22c55e', '#ffffff'],
        });
        soundManager.playLevelUp();
      }

      // Level up every 6 spoons
      const newLevel = Math.floor(newSpoons / 6) + 1;
      if (newLevel > stateRef.current.level) {
        soundManager.playLevelUp();
        updateLevelParameters(newLevel);
      }

      const quip = isPerfect
        ? soundManager.getRandomQuip('hit')
        : newCombo >= 3
        ? soundManager.getRandomQuip('combo')
        : "Down the hatch!";

      if (Math.random() > 0.4) {
        soundManager.speak(quip);
      }

      setState(prev => ({
        ...prev,
        score: newScore,
        hunger: newHunger,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        spoonsEaten: newSpoons,
        level: newLevel,
        activeQuip: quip,
        quipType: isPerfect ? 'combo' : 'hit',
      }));
    } else {
      // MISSED ATTEMPT!
      soundManager.playMiss();
      soundManager.playStrike();

      if (onSceneFeed.current) {
        onSceneFeed.current(false);
      }

      const newMissCount = stateRef.current.missCount + 1;
      const quip = soundManager.getRandomQuip('miss');
      soundManager.speak(quip);

      setState(prev => ({
        ...prev,
        missCount: newMissCount,
        combo: 0,
        activeQuip: quip,
        quipType: 'miss',
      }));

      // THREE MISSES = GAME OVER!
      if (newMissCount >= stateRef.current.maxMisses) {
        setTimeout(() => {
          handleGameOver('misses');
        }, 550);
      }
    }
  }, [state.isPlaying, state.isPaused, state.isGameOver, handleGameOver, sceneConfig, updateLevelParameters]);

  // Start game
  const startGame = useCallback(() => {
    if (onSceneReset.current) {
      onSceneReset.current();
    }
    soundManager.startAfrobeatMusic();
    const startQuip = soundManager.getRandomQuip('start');
    soundManager.speak(startQuip);

    needleDirRef.current = 1;
    updateLevelParameters(1);

    setState(prev => ({
      ...prev,
      score: 0,
      level: 1,
      missCount: 0,
      hunger: 100,
      combo: 0,
      spoonsEaten: 0,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      gameOverReason: null,
      activeQuip: startQuip,
      quipType: 'idle',
      meterPosition: 20,
    }));
  }, [updateLevelParameters]);

  // Pause toggle
  const togglePause = useCallback(() => {
    setState(prev => {
      const willPause = !prev.isPaused;
      if (willPause) {
        soundManager.stopAfrobeatMusic();
      } else {
        soundManager.startAfrobeatMusic();
      }
      return { ...prev, isPaused: willPause };
    });
  }, []);

  // Restart
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return {
    state,
    feed,
    startGame,
    restartGame,
    togglePause,
    onSceneFeed,
    onSceneGameOver,
    onSceneReset,
    onSceneMouthUpdate,
  };
}
