import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';

export const PokemonQuiz = () => {
  const [question, setQuestion] = useState<{ pokemon: Pokemon, options: Pokemon[] } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const { playSound } = useSound();
  const { addScore } = useProgress();

  const generateQuestion = () => {
    const correct = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
    const others = POKEMON_LIST
      .filter(p => p.id !== correct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setQuestion({
      pokemon: correct,
      options: [correct, ...others].sort(() => Math.random() - 0.5)
    });
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (id: number) => {
    if (feedback) return;
    if (id === question?.pokemon.id) {
      setFeedback('correct');
      playSound('success');
      addScore(50);
      setTimeout(generateQuestion, 1500);
    } else {
      setFeedback('wrong');
      playSound('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!question) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Quiz Pokémon</h2>
      <p className="text-slate-500 mb-8">Qual é o nome deste Pokémon?</p>

      <div className="w-48 h-48 bg-slate-50 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-inner">
        <img src={question.pokemon.sprite} alt="?" className="w-32 h-32 pixelated animate-float" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {question.options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt.id)}
            onMouseEnter={() => playSound('hover')}
            className={`p-4 rounded-2xl border-2 font-bold transition-all active:scale-95 ${
              feedback === 'correct' && opt.id === question.pokemon.id 
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : feedback === 'wrong' && opt.id !== question.pokemon.id
                ? 'bg-slate-50 border-slate-100'
                : 'bg-white border-slate-100 hover:border-indigo-500 text-slate-700'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
};
