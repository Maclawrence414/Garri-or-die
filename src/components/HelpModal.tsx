/**
 * Help & How to Play Modal
 */

import React from 'react';
import { X, Utensils, Heart, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-7 shadow-2xl text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <h2 className="font-arcade text-2xl text-amber-400">HOW TO PLAY</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-300">
          <div className="flex items-start gap-3 bg-stone-800/60 p-3.5 rounded-2xl border border-stone-700">
            <Utensils className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold text-white block mb-0.5">1. Deliver the Spoon</span>
              <p>
                Watch the delivery needle oscillate. When the spoon aligns with the mouth target
                (green sweet-spot in the center), tap <strong>FEED SPOON</strong> or press the{' '}
                <strong>SPACEBAR</strong> / <strong>ENTER</strong> key!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-950/40 p-3.5 rounded-2xl border border-red-800/50">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold text-red-300 block mb-0.5">2. THREE MISSES = DIE!</span>
              <p>
                If you miss the mouth, garri splatters, and you get a strike ❌. Reach{' '}
                <strong>3 misses</strong> and your character dramatically collapses from hunger in
                a comic faint!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/50">
            <Heart className="text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold text-emerald-300 block mb-0.5">3. Maintain Stomach Fuel</span>
              <p>
                Your hunger meter is constantly ticking down! Every clean mouthful replenishes your
                stomach fuel. Don't let it reach 0%!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-stone-800/60 p-3.5 rounded-2xl border border-stone-700">
            <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div>
              <span className="font-bold text-white block mb-0.5">4. Build Combos & High Scores</span>
              <p>
                Hit consecutive sweet spots for 2x, 3x, and 5x Odogwu multipliers. Customize your
                garri toppings in the Prep Kitchen for special power-ups!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-arcade text-lg tracking-wider transition shadow-lg"
        >
          I UNDERSTAND, MAKE WE SOAK!
        </button>
      </div>
    </div>
  );
};
