/**
 * Main Application Component for GARRI OR DIE!
 * Ties together the Three.js 3D GameScene, Audio Synthesizer,
 * Gameplay Loop, Game HUD, and Interactive Modals.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameScene, SceneConfig } from './game/three/GameScene';
import { useGameState } from './game/useGameState';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { GarriPrepModal } from './components/GarriPrepModal';
import { HelpModal } from './components/HelpModal';
import { StartScreen } from './components/StartScreen';
import { soundManager } from './audio/SoundManager';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  // Scene Configuration (Garri style, toppings, outfit)
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(() => {
    const saved = localStorage.getItem('garri_prep_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      garriType: 'ijebu',
      outfit: 'ankara',
      toppings: {
        groundnuts: true,
        milk: true,
        ice: false,
      },
    };
  });

  // Modals state
  const [showPrepModal, setShowPrepModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Core Game State Hook
  const {
    state,
    feed,
    startGame,
    restartGame,
    onSceneFeed,
    onSceneGameOver,
    onSceneReset,
    onSceneMouthUpdate,
  } = useGameState(sceneConfig);

  // Initialize Three.js Game Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new GameScene(containerRef.current, sceneConfig);
    gameSceneRef.current = scene;

    // Connect hook callbacks to 3D scene actions
    onSceneFeed.current = (isSuccess: boolean) => {
      scene.triggerFeed(isSuccess);
      if (!isSuccess) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 350);
      }
    };

    onSceneGameOver.current = () => {
      scene.triggerGameOverFaint();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
    };

    onSceneReset.current = () => {
      scene.reset();
    };

    onSceneMouthUpdate.current = (openAmount: number) => {
      scene.setMouthOpen(openAmount);
    };

    return () => {
      scene.destroy();
      gameSceneRef.current = null;
    };
  }, []);

  // Update scene config when user changes options in the Prep Modal
  const handleUpdateConfig = useCallback((newConfig: SceneConfig) => {
    setSceneConfig(newConfig);
    localStorage.setItem('garri_prep_config', JSON.stringify(newConfig));
    if (gameSceneRef.current) {
      gameSceneRef.current.updateConfig(newConfig);
    }
  }, []);

  // Sync hunger ratio to 3D scene (for hunger tremors and eye expressions)
  useEffect(() => {
    if (gameSceneRef.current) {
      gameSceneRef.current.setHungerLevel(state.hunger / 100);
    }
  }, [state.hunger]);

  // Global Keyboard listener for Spacebar and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (state.isPlaying && !state.isGameOver && !state.isPaused) {
          feed();
        } else if (!state.isPlaying && !state.isGameOver && !showPrepModal && !showHelpModal) {
          startGame();
        } else if (state.isGameOver) {
          restartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, state.isGameOver, state.isPaused, showPrepModal, showHelpModal, feed, startGame, restartGame]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-stone-950 select-none ${
        screenShake ? 'animate-game-shake' : ''
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={() => {
          if (state.isPlaying && !state.isGameOver) {
            feed();
          }
        }}
      />

      {/* Heads-Up Display (HUD) */}
      <GameHUD
        state={state}
        onFeed={feed}
        onOpenPrep={() => setShowPrepModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onToggleMute={toggleMute}
        isMuted={isMuted}
      />

      {/* Start Game Overlay */}
      {!state.isPlaying && !state.isGameOver && (
        <StartScreen
          onStart={startGame}
          onOpenPrep={() => setShowPrepModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          highScore={state.highScore}
        />
      )}

      {/* Game Over Modal (3 Misses or Starvation) */}
      {state.isGameOver && (
        <GameOverModal
          state={state}
          onRestart={restartGame}
          onOpenPrep={() => setShowPrepModal(true)}
        />
      )}

      {/* Garri Prep Kitchen Modal */}
      {showPrepModal && (
        <GarriPrepModal
          config={sceneConfig}
          onUpdateConfig={handleUpdateConfig}
          onClose={() => setShowPrepModal(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </main>
  );
}
