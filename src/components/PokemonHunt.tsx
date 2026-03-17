import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';

export const PokemonHunt = () => {
  const [activePokemon, setActivePokemon] = useState<{ pokemon: Pokemon, x: number, y: number } | null>(null);
  const { playSound } = useSound();
  const { capturePokemon } = useProgress();

  useEffect(() => {
    const spawn = () => {
      const pokemon = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
      setActivePokemon({
        pokemon,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });

      // Disappear after some time
      setTimeout(() => {
        setActivePokemon(null);
      }, 2000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) spawn();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCatch = () => {
    if (!activePokemon) return;
    capturePokemon(activePokemon.pokemon.id);
    playSound('capture', activePokemon.pokemon.rarity);
    setActivePokemon(null);
  };

  return (
    <div className="relative w-full h-[500px] bg-emerald-50 rounded-3xl shadow-inner overflow-hidden border-4 border-emerald-100">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-xl font-black text-emerald-800">Caça ao Pokémon</h2>
        <p className="text-emerald-600 text-sm">Clique neles antes que sumam!</p>
      </div>

      <AnimatePresence>
        {activePokemon && (
          <motion.button
            key={activePokemon.pokemon.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleCatch}
            onMouseEnter={() => playSound('hover')}
            style={{ left: `${activePokemon.x}%`, top: `${activePokemon.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
          >
            <div className="absolute inset-0 bg-white/50 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src={activePokemon.pokemon.sprite} 
              alt="Catch me" 
              className="w-20 h-20 pixelated relative z-10 animate-float"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Grass decorations */}
      {[...Array(10)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-8 h-8 text-emerald-200 opacity-30"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        >
          🌿
        </div>
      ))}
    </div>
  );
};
