/**
 * Garri Preparation & Customizer Modal
 * Allows players to choose their Garri Type (Ijebu, Yellow, Student Special),
 * Toppings (Groundnuts, Milk & Sugar, Ice Block), and Character Outfits.
 */

import React from 'react';
import { SceneConfig } from '../game/three/GameScene';
import { X, Check, Flame, Snowflake, Milk, Shirt } from 'lucide-react';

interface GarriPrepModalProps {
  config: SceneConfig;
  onUpdateConfig: (newConfig: SceneConfig) => void;
  onClose: () => void;
}

export const GarriPrepModal: React.FC<GarriPrepModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const selectGarriType = (type: SceneConfig['garriType']) => {
    onUpdateConfig({ ...config, garriType: type });
  };

  const selectOutfit = (outfit: SceneConfig['outfit']) => {
    onUpdateConfig({ ...config, outfit: outfit });
  };

  const toggleTopping = (topping: keyof SceneConfig['toppings']) => {
    onUpdateConfig({
      ...config,
      toppings: {
        ...config.toppings,
        [topping]: !config.toppings[topping],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div>
            <h2 className="font-arcade text-2xl text-amber-400 tracking-wider">
              GARRI PREP KITCHEN
            </h2>
            <p className="text-xs text-stone-400">
              Customize your cassava bowl & survival drip!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Garri Variety Selection */}
        <div className="mb-6">
          <label className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-2.5">
            1. CHOOSE YOUR GARRI VARIETY
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Ijebu Garri */}
            <button
              onClick={() => selectGarriType('ijebu')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                config.garriType === 'ijebu'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700 hover:border-stone-500'
              }`}
            >
              <div>
                <span className="font-bold text-amber-300 text-sm block">Ijebu Garri</span>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Sour, crisp, classic floating granules.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-2 block">
                Standard Balanced
              </span>
            </button>

            {/* Bendel Yellow Garri */}
            <button
              onClick={() => selectGarriType('yellow')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                config.garriType === 'yellow'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700 hover:border-stone-500'
              }`}
            >
              <div>
                <span className="font-bold text-yellow-400 text-sm block">Yellow (Bendel)</span>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Rich palm-oil enriched golden crunch.
                </span>
              </div>
              <span className="text-[10px] text-yellow-300 font-semibold mt-2 block">
                Rich Flavor Boost
              </span>
            </button>

            {/* Student Special */}
            <button
              onClick={() => selectGarriType('student')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                config.garriType === 'student'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700 hover:border-stone-500'
              }`}
            >
              <div>
                <span className="font-bold text-slate-200 text-sm block">Student Special</span>
                <span className="text-[11px] text-stone-400 block mt-1 leading-snug">
                  Cloudy tap water & sheer willpower.
                </span>
              </div>
              <span className="text-[10px] text-blue-400 font-semibold mt-2 block">
                Pure Street Cred
              </span>
            </button>
          </div>
        </div>

        {/* 2. Survival Toppings */}
        <div className="mb-6">
          <label className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-2.5">
            2. ADD POWER-UP TOPPINGS
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Groundnuts */}
            <button
              onClick={() => toggleTopping('groundnuts')}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                config.toppings.groundnuts
                  ? 'bg-amber-950/60 border-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
                  <Flame size={16} />
                  <span>Groundnuts (Epa)</span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  +50% Combo Score
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                  config.toppings.groundnuts
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'border-stone-600'
                }`}
              >
                {config.toppings.groundnuts && <Check size={14} className="stroke-[3]" />}
              </div>
            </button>

            {/* Peak Milk & Sugar */}
            <button
              onClick={() => toggleTopping('milk')}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                config.toppings.milk
                  ? 'bg-amber-950/60 border-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-sm">
                  <Milk size={16} />
                  <span>Peak Milk & Sugar</span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  +38% Hunger Refill
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                  config.toppings.milk
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'border-stone-600'
                }`}
              >
                {config.toppings.milk && <Check size={14} className="stroke-[3]" />}
              </div>
            </button>

            {/* Ice Block */}
            <button
              onClick={() => toggleTopping('ice')}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                config.toppings.ice
                  ? 'bg-amber-950/60 border-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-sm">
                  <Snowflake size={16} />
                  <span>Chilled Ice Block</span>
                </div>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  -25% Hunger Decay
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                  config.toppings.ice
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'border-stone-600'
                }`}
              >
                {config.toppings.ice && <Check size={14} className="stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* 3. Character Outfits */}
        <div className="mb-6">
          <label className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-2.5">
            3. CHARACTER OUTFIT
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => selectOutfit('ankara')}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                config.outfit === 'ankara'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <Shirt size={18} className="text-amber-400" />
              <div>
                <span className="font-bold text-xs text-white block">Lagos Ankara</span>
                <span className="text-[10px] text-stone-400">Colorful classic</span>
              </div>
            </button>

            <button
              onClick={() => selectOutfit('jersey')}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                config.outfit === 'jersey'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <Shirt size={18} className="text-emerald-400" />
              <div>
                <span className="font-bold text-xs text-white block">Super Eagles '94</span>
                <span className="text-[10px] text-stone-400">Green & White Pride</span>
              </div>
            </button>

            <button
              onClick={() => selectOutfit('singlet')}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                config.outfit === 'singlet'
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-stone-800/60 border-stone-700'
              }`}
            >
              <Shirt size={18} className="text-slate-300" />
              <div>
                <span className="font-bold text-xs text-white block">Hostel Singlet</span>
                <span className="text-[10px] text-stone-400">Midnight Exam Mode</span>
              </div>
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-arcade text-lg tracking-wider transition shadow-lg"
        >
          SAVE & SERVE BOWL
        </button>
      </div>
    </div>
  );
};
