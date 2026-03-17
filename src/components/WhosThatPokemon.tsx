import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';
import confetti from 'canvas-confetti';

export const WhosThatPokemon = () => {
  const [current, setCurrent] = useState<Pokemon | null>(null);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const { playSound } = useSound();
  const { capturePokemon, addScore } = useProgress();

  const nextPokemon = () => {
    const pool = difficulty === 'easy' ? POKEMON_LIST.slice(0, 50) : POKEMON_LIST;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(random);
    setRevealed(false);
    setGuess('');
    setFeedback(null);
  };

  useEffect(() => {
    nextPokemon();
  }, [difficulty]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || revealed) return;

    if (guess.toLowerCase().trim() === current.name.toLowerCase()) {
      setRevealed(true);
      setFeedback('correct');
      playSound('success');
      capturePokemon(current.id);
      addScore(difficulty === 'easy' ? 50 : 150);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setFeedback('wrong');
      playSound('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!current) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl max-w-md mx-auto">
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-full">
        <button 
          onClick={() => setDifficulty('easy')}
          onMouseEnter={() => playSound('hover')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${difficulty === 'easy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
        >
          FÁCIL
        </button>
        <button 
          onClick={() => setDifficulty('hard')}
          onMouseEnter={() => playSound('hover')}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${difficulty === 'hard' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
        >
          DIFÍCIL
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Quem é esse Pokémon?</h2>
      
      <div className="relative w-48 h-48 mb-8 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
        <motion.img
          key={current.id}
          src={current.sprite}
          alt="Pokemon"
          className={`w-40 h-40 pixelated transition-all duration-500 ${revealed ? '' : 'brightness-0 contrast-100'}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
      </div>

      <form onSubmit={handleGuess} className="w-full space-y-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Digite o nome..."
          disabled={revealed}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all text-center text-lg font-medium"
        />
        
        {!revealed ? (
          <button
            type="submit"
            onMouseEnter={() => playSound('hover')}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
          >
            Adivinhar
          </button>
        ) : (
          <button
            type="button"
            onClick={nextPokemon}
            onMouseEnter={() => playSound('hover')}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
          >
            Próximo
          </button>
        )}
      </form>

      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-red-500 font-bold"
          >
            Tente novamente!
          </motion.p>
        )}
        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-emerald-600 font-bold text-xl"
          >
            É o {current.name}!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
