import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon, RARITY_COLORS } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';
import { Loader2, Sparkles } from 'lucide-react';

export const PokemonRoulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Pokemon | null>(null);
  const { playSound } = useSound();
  const { capturePokemon, progress, addScore } = useProgress();

  const spin = () => {
    if (isSpinning || progress.score < 500) return;
    
    setIsSpinning(true);
    addScore(-500);
    setResult(null);
    playSound('click');

    // Simulate spin
    setTimeout(() => {
      const random = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
      setResult(random);
      setIsSpinning(false);
      capturePokemon(random.id);
      playSound('capture', random.rarity);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-black text-slate-800 mb-2">Roleta Pokémon</h2>
      <p className="text-slate-500 mb-8 font-medium">Custo: 500 pts</p>

      <div className="relative w-64 h-64 mx-auto mb-8">
        <div className={`w-full h-full rounded-full border-8 border-slate-100 flex items-center justify-center bg-slate-50 shadow-inner ${isSpinning ? 'animate-spin' : ''}`}>
          {isSpinning ? (
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          ) : result ? (
            <motion.img 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              src={result.sprite} 
              className="w-40 h-40 pixelated" 
            />
          ) : (
            <Sparkles className="w-12 h-12 text-slate-200" />
          )}
        </div>
        
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-red-500 rounded-full shadow-lg z-10" />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className={`text-sm font-black uppercase tracking-widest ${RARITY_COLORS[result.rarity]}`}>
              {result.rarity}
            </p>
            <h3 className="text-2xl font-black text-slate-800 capitalize">{result.name}</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={spin}
        onMouseEnter={() => playSound('hover')}
        disabled={isSpinning || progress.score < 500}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? 'GIRANDO...' : 'GIRAR ROLETA'}
      </button>
    </div>
  );
};
