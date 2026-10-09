/**
 * Game Over Modal Component
 * Displays dramatic comic collapse summary, 3-misses status, final score,
 * highest level reached, funny cause of collapse, and restart button.
 */

import React from 'react';
import { GameState } from '../game/useGameState';
import { RotateCcw, Trophy, Skull, UtensilsCrossed, Award } from 'lucide-react';

interface GameOverModalProps {
  state: GameState;
  onRestart: () => void;
  onOpenPrep: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  onRestart,
  onOpenPrep,
}) => {
  const { score, highScore, level, spoonsEaten, maxCombo, gameOverReason, missCount } = state;

  const funnyObituaries = [
    "Cause of collapse: Clumsy Spoon Disorder. The garri was innocent.",
    "He survived Lagos traffic, but 3 missed spoonfuls ended his career.",
    "The hunger wired him directly into the spirit realm.",
    "Cassava fell on the floor and so did he. Rest in peace.",
    "Groundnuts refused to enter his mouth. A national tragedy.",
  ];

  const randomObituary = funnyObituaries[Math.floor((score + level) % funnyObituaries.length)];
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-white overflow-hidden flex flex-col items-center">
        {/* Cartoon Danger Stripes Banner */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Comic Death Header Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-3 text-red-400">
          <Skull size={40} className="animate-bounce" />
        </div>

        {/* Large GAME OVER Title */}
        <h2 className="font-arcade text-3xl sm:text-5xl text-red-500 tracking-wider mb-1 drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)]">
          GAME OVER!
        </h2>

        <p className="text-amber-300 font-bold text-sm sm:text-base uppercase tracking-widest mb-3">
          {gameOverReason === 'misses'
            ? `THREE MISSES REACHED (${missCount}/3 STRIKES)`
            : 'HUNGER REACHED ZERO! COMPLETE COLLAPSE!'}
        </p>

        {/* Comedic Nigerian Obituary Box */}
        <div className="w-full bg-stone-950/70 border border-stone-800 rounded-2xl p-3 sm:p-4 mb-5 text-stone-300 text-xs sm:text-sm italic">
          "{randomObituary}"
        </div>

        {/* Score & Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left">
          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
              Final Score
            </span>
            <div className="font-arcade text-xl sm:text-2xl text-amber-400 flex items-center gap-1.5">
              <span>{score.toLocaleString()}</span>
              {isNewHighScore && (
                <span className="text-[10px] font-sans font-black bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded-md">
                  NEW BEST!
                </span>
              )}
            </div>
          </div>

          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
              High Score
            </span>
            <div className="font-arcade text-xl sm:text-2xl text-stone-200 flex items-center gap-1.5">
              <Trophy size={18} className="text-amber-500" />
              <span>{highScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
              Level Reached
            </span>
            <div className="font-arcade text-lg sm:text-xl text-amber-300 flex items-center gap-1.5">
              <Award size={18} className="text-amber-400" />
              <span>Level {level}</span>
            </div>
          </div>

          <div className="bg-stone-800/80 rounded-2xl p-3 border border-stone-700">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
              Spoons Eaten & Combo
            </span>
            <div className="font-arcade text-lg sm:text-xl text-emerald-400 flex items-center gap-1.5">
              <UtensilsCrossed size={18} className="text-emerald-400" />
              <span>{spoonsEaten} (x{maxCombo})</span>
            </div>
          </div>
        </div>

        {/* Buttons: Restart & Prep */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-950 font-arcade text-lg sm:text-xl tracking-wider shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw size={22} className="stroke-[2.5]" />
            <span>TRY AGAIN (SOAK MORE!)</span>
          </button>
          <button
            onClick={onOpenPrep}
            className="w-full sm:w-auto py-3.5 sm:py-4 px-5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-bold text-sm tracking-wide transition active:scale-95"
          >
            Switch Garri Style
          </button>
        </div>
      </div>
    </div>
  );
};
