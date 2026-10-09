/**
 * Start Screen Overlay
 * Punchy arcade title screen before game starts
 */

import React from 'react';
import { Play, Palette, HelpCircle, Trophy, Flame } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenPrep: () => void;
  onOpenHelp: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenPrep,
  onOpenHelp,
  highScore,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900/95 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-white flex flex-col items-center">
        {/* Nigerian Green-White-Green Top Accent Ribbon */}
        <div className="flex w-32 h-2.5 rounded-full overflow-hidden mb-4 shadow-md">
          <div className="w-1/3 bg-green-600" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-green-600" />
        </div>

        {/* Title Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Flame size={14} className="text-amber-400" />
          <span>Hilarious Survival Arcade</span>
        </div>

        {/* Big Game Title */}
        <h1 className="font-arcade text-4xl sm:text-6xl text-amber-400 tracking-wider mb-1 drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
          GARRI OR DIE!
        </h1>

        <p className="text-stone-300 text-xs sm:text-sm font-semibold mb-5 max-w-sm">
          Deliver every spoonful of soaked garri into the mouth.
          <br />
          <span className="text-red-400 font-extrabold uppercase">
            3 misses and you collapse from hunger!
          </span>
        </p>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="flex items-center gap-2 bg-stone-800/80 px-4 py-2 rounded-2xl border border-stone-700 mb-6">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-xs text-stone-400 font-bold uppercase">All-Time Best:</span>
            <span className="font-arcade text-amber-300 text-base">{highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-arcade text-xl sm:text-2xl tracking-wider shadow-xl flex items-center justify-center gap-3 transition active:scale-95 border-t-2 border-amber-200"
          >
            <Play size={24} className="fill-stone-950" />
            <span>SOAK & PLAY!</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={onOpenPrep}
              className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Palette size={16} />
              <span>Prep Garri Drip</span>
            </button>
            <button
              onClick={onOpenHelp}
              className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <HelpCircle size={16} />
              <span>How to Play</span>
            </button>
          </div>
        </div>

        {/* Keyboard shortcut tip */}
        <p className="text-[11px] text-stone-500 mt-5 font-mono">
          Tip: Tap anywhere or press [SPACEBAR] to feed the spoon!
        </p>
      </div>
    </div>
  );
};
