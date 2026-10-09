/**
 * Game HUD Component
 * Displays the Score, Level, 3-Miss Strike Indicators, Hunger Gauge,
 * Dynamic Spoon Delivery Meter, Speech Bubbles, and Controls.
 */

import React from 'react';
import { GameState } from '../game/useGameState';
import { Volume2, VolumeX, Sparkles, Utensils, HeartPulse, HelpCircle, Palette } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface GameHUDProps {
  state: GameState;
  onFeed: () => void;
  onOpenPrep: () => void;
  onOpenHelp: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  onFeed,
  onOpenPrep,
  onOpenHelp,
  onToggleMute,
  isMuted,
}) => {
  const {
    score,
    highScore,
    level,
    missCount,
    maxMisses,
    hunger,
    combo,
    meterPosition,
    sweetSpotStart,
    sweetSpotEnd,
    perfectSpotStart,
    perfectSpotEnd,
    activeQuip,
    isPlaying,
    flyActive,
    flyX,
    flyY,
  } = state;

  // Level names with cultural Nigerian humour
  const getLevelName = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Morning Soaking (Fresh Guy)';
      case 2:
        return 'Hostel Rush (Hunger Dey Wire)';
      case 3:
        return 'Housefly Invasion (Swat & Swallow)';
      case 4:
        return 'NEPA Light Flicker (Dark Chomp)';
      default:
        return `Odogwu Survival (Level ${lvl})`;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-start justify-between gap-3 w-full max-w-5xl mx-auto">
        {/* Left: Score & High Score */}
        <div className="bg-stone-900/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 text-white shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-amber-400 font-arcade text-lg sm:text-2xl tracking-wider">
              {score.toLocaleString()}
            </span>
            <span className="text-xs uppercase font-bold text-amber-200/70 tracking-widest">PTS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
            <span>HI: {highScore.toLocaleString()}</span>
            <span>·</span>
            <span className="text-amber-300 font-semibold">{getLevelName(level)}</span>
          </div>
        </div>

        {/* Center: The CRITICAL 3-MISS COUNT TRACKER */}
        <div className="flex flex-col items-center bg-stone-900/90 backdrop-blur-md border border-red-500/50 rounded-2xl px-3 sm:px-5 py-2 shadow-2xl pointer-events-auto">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-300 mb-1">
            STRIKES (3 MISSES = DIE)
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: maxMisses }).map((_, idx) => {
              const isMissed = idx < missCount;
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-arcade text-lg sm:text-xl transition-all duration-300 ${
                    isMissed
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 scale-110 animate-bounce'
                      : 'bg-stone-800/80 border border-stone-700 text-stone-500'
                  }`}
                >
                  {isMissed ? '✕' : idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 sm:p-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-amber-300 border border-amber-500/30 transition shadow-lg active:scale-95"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={onOpenPrep}
            aria-label="Customize Garri Bowl"
            className="p-2 sm:p-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-amber-300 border border-amber-500/30 transition shadow-lg active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <Palette size={18} />
            <span className="hidden sm:inline">Prep Garri</span>
          </button>
          <button
            onClick={onOpenHelp}
            aria-label="Help / How to Play"
            className="p-2 sm:p-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-amber-300 border border-amber-500/30 transition shadow-lg active:scale-95"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Middle Floating Elements: Comic Speech Bubble & Buzzing Fly Hazard */}
      <div className="relative w-full max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center pointer-events-none">
        {/* Pidgin Speech Bubble */}
        {activeQuip && (
          <div className="animate-float-up bg-amber-100 text-stone-900 border-2 border-stone-900 px-4 py-2 rounded-2xl shadow-2xl text-center max-w-xs sm:max-w-md font-bold text-sm sm:text-base relative mb-48 pointer-events-none">
            "{activeQuip}"
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-100 border-r-2 border-b-2 border-stone-900 rotate-45" />
          </div>
        )}

        {/* Comedic Housefly hazard flying across the path on Level 3+ */}
        {flyActive && isPlaying && (
          <div
            className="absolute pointer-events-none transition-all duration-100 ease-out z-20 flex flex-col items-center text-xs"
            style={{
              left: `${flyX}%`,
              top: `${flyY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-xl animate-spin">🪰</span>
            <span className="text-[10px] bg-black/70 text-amber-300 px-1 rounded font-mono font-bold">
              BZZZZ!
            </span>
          </div>
        )}

        {/* Combo Multiplier Alert */}
        {combo >= 2 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-arcade text-sm sm:text-base px-3.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-pulse">
            <Sparkles size={16} />
            {combo >= 5 ? '🔥 ODOGWU STREAK ' : 'CHOMP COMBO '} x{combo}!
          </div>
        )}
      </div>

      {/* Bottom Controls Area: Hunger Bar, Spoon Meter & Big Action Button */}
      <footer className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3 pb-2 sm:pb-4 pointer-events-auto">
        {/* Hunger Survival Bar */}
        <div className="w-full bg-stone-900/90 backdrop-blur-md border border-amber-600/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <div className="flex items-center gap-1.5 text-amber-300">
              <HeartPulse size={16} className={hunger < 25 ? 'animate-ping text-red-500' : ''} />
              <span>STOMACH FUEL (DON'T FAINT!)</span>
            </div>
            <span
              className={`font-arcade ${
                hunger > 50 ? 'text-emerald-400' : hunger > 25 ? 'text-amber-400' : 'text-red-500 animate-pulse'
              }`}
            >
              {Math.round(hunger)}%
            </span>
          </div>
          <div className="w-full h-3.5 bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                hunger > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : hunger > 25
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
              }`}
              style={{ width: `${Math.max(4, hunger)}%` }}
            />
          </div>
        </div>

        {/* Dynamic Delivery Sweet-Spot Timing Meter */}
        <div className="w-full bg-stone-900/95 backdrop-blur-md border-2 border-amber-500 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-amber-200 px-1">
            <span>SPOON TRAJECTORY</span>
            <span className="text-emerald-400">HIT CENTER FOR CRUNCH!</span>
            <span>MOUTH TARGET</span>
          </div>

          {/* The Meter Track */}
          <div className="relative w-full h-8 sm:h-9 bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-inner">
            {/* Red Miss Left Zone */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-red-950/60 border-r border-red-700/40"
              style={{ width: `${sweetSpotStart}%` }}
            />

            {/* Yellow Good Zone */}
            <div
              className="absolute top-0 bottom-0 bg-amber-500/40"
              style={{
                left: `${sweetSpotStart}%`,
                width: `${sweetSpotEnd - sweetSpotStart}%`,
              }}
            />

            {/* Green Perfect Sweet-Spot Zone */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/80 border-x-2 border-emerald-300 flex items-center justify-center"
              style={{
                left: `${perfectSpotStart}%`,
                width: `${perfectSpotEnd - perfectSpotStart}%`,
              }}
            >
              <span className="text-[9px] font-black text-white uppercase tracking-tighter opacity-80">
                SWEET
              </span>
            </div>

            {/* Red Miss Right Zone */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-red-950/60 border-l border-red-700/40"
              style={{ width: `${100 - sweetSpotEnd}%` }}
            />

            {/* The Moving Needle / Spoon Cursor */}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-white shadow-[0_0_12px_#ffffff] rounded-full -translate-x-1/2 transition-none z-10 flex flex-col items-center justify-between py-0.5"
              style={{ left: `${meterPosition}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Action FEED Button */}
          <button
            onClick={onFeed}
            disabled={!isPlaying}
            className={`w-full py-3 sm:py-4 px-6 rounded-2xl font-arcade text-lg sm:text-2xl tracking-wider uppercase transition-all duration-100 flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 border-t-2 border-amber-200 shadow-amber-600/40'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Utensils size={24} className="stroke-[2.5]" />
            <span>{isPlaying ? 'FEED SPOON! (SPACEBAR)' : 'GAME PAUSED'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
