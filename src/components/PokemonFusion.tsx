import { useState } from 'react';
import { motion } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { RefreshCw, Zap } from 'lucide-react';

export const PokemonFusion = () => {
  const [p1, setP1] = useState<Pokemon>(POKEMON_LIST[0]);
  const [p2, setP2] = useState<Pokemon>(POKEMON_LIST[3]);
  const { playSound } = useSound();

  const randomize = () => {
    setP1(POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)]);
    setP2(POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)]);
    playSound('battle');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-black text-slate-800 mb-8">Pokémon Fusion</h2>
      
      <div className="flex items-center justify-center gap-8 mb-12">
        <div className="space-y-4">
          <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
            <img src={p1.sprite} className="w-24 h-24 pixelated" alt="P1" />
          </div>
          <p className="font-bold text-slate-600 capitalize">{p1.name}</p>
        </div>

        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <Zap className="w-6 h-6" />
        </div>

        <div className="space-y-4">
          <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
            <img src={p2.sprite} className="w-24 h-24 pixelated" alt="P2" />
          </div>
          <p className="font-bold text-slate-600 capitalize">{p2.name}</p>
        </div>
      </div>

      <div className="relative w-64 h-64 bg-indigo-50 rounded-[3rem] mx-auto mb-12 flex items-center justify-center border-4 border-indigo-100 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-50" />
        
        <motion.div
          key={`${p1.id}-${p2.id}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative"
        >
          <img 
            src={p1.sprite} 
            className="w-48 h-48 pixelated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" 
            style={{ filter: 'hue-rotate(90deg)' }}
          />
          <img 
            src={p2.sprite} 
            className="w-48 h-48 pixelated relative z-10 mix-blend-multiply" 
          />
        </motion.div>
      </div>

      <button
        onClick={randomize}
        onMouseEnter={() => playSound('hover')}
        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95 mx-auto"
      >
        <RefreshCw className="w-5 h-5" />
        FUNDIR POKÉMON
      </button>

      <p className="mt-8 text-slate-400 text-sm italic">
        {p1.name.substring(0, Math.floor(p1.name.length / 2))}
        {p2.name.substring(Math.floor(p2.name.length / 2))}
      </p>
    </div>
  );
};
