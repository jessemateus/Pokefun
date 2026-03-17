import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';

export const PokemonRunner = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState<{ id: number, x: number }[]>([]);
  const [playerPokemon] = useState(POKEMON_LIST[24]); // Pikachu
  const { playSound } = useSound();
  const { addScore } = useProgress();
  const gameRef = useRef<HTMLDivElement>(null);

  const jump = () => {
    if (playerY === 0) {
      setPlayerY(100);
      playSound('click');
      setTimeout(() => setPlayerY(0), 500);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setObstacles(prev => {
        const next = prev
          .map(o => ({ ...o, x: o.x - 5 }))
          .filter(o => o.x > -10);
        
        if (Math.random() > 0.95) {
          next.push({ id: Date.now(), x: 100 });
        }
        return next;
      });
      setScore(s => s + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const collision = obstacles.some(o => o.x > 5 && o.x < 15 && playerY < 40);
    if (collision) {
      setIsPlaying(false);
      playSound('error');
      addScore(Math.floor(score / 10));
      setObstacles([]);
    }
  }, [obstacles, playerY]);

  return (
    <div 
      className="relative w-full h-64 bg-sky-50 rounded-3xl shadow-inner overflow-hidden border-4 border-sky-100 cursor-pointer"
      onClick={isPlaying ? jump : () => { setIsPlaying(true); setScore(0); }}
      onMouseEnter={() => playSound('hover')}
    >
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-xl font-black text-sky-800">Pikachu Runner</h2>
        <p className="text-sky-600 text-sm">Clique para pular!</p>
      </div>

      <div className="absolute top-4 right-4 z-10 font-mono font-bold text-sky-800">
        SCORE: {score}
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <p className="bg-white px-6 py-3 rounded-2xl font-black text-slate-800 shadow-xl">CLIQUE PARA COMEÇAR</p>
        </div>
      )}

      {/* Player */}
      <motion.div
        animate={{ y: -playerY }}
        className="absolute bottom-8 left-8"
      >
        <img src={playerPokemon.sprite} className="w-16 h-16 pixelated" alt="Player" />
      </motion.div>

      {/* Obstacles */}
      {obstacles.map(o => (
        <div 
          key={o.id}
          className="absolute bottom-8 w-8 h-8 bg-red-500 rounded-lg"
          style={{ left: `${o.x}%` }}
        />
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-8 bg-slate-200" />
    </div>
  );
};
