import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  pokemon: Pokemon;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const { playSound } = useSound();
  const { unlockAchievement, addScore } = useProgress();

  const initGame = () => {
    // Select 8 random pokemon
    const selected = [...POKEMON_LIST]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    
    const gameCards = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((p, index) => ({
        id: index,
        pokemon: p,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(gameCards);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    playSound('click');
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].pokemon.id === cards[second].pokemon.id) {
        // Match
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlipped([]);
          setMatches(prev => prev + 1);
          playSound('success');

          if (matches + 1 === 8) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 }
            });
            addScore(500);
            if (moves + 1 <= 15) {
              unlockAchievement('memory_pro');
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlipped([]);
          playSound('error');
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Jogo da Memória</h2>
          <p className="text-slate-500 font-medium">Encontre os pares!</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Movimentos</p>
            <p className="text-xl font-black text-indigo-600">{moves}</p>
          </div>
          <button
            onClick={initGame}
            onMouseEnter={() => playSound('hover')}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors text-slate-700"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            onMouseEnter={() => playSound('hover')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="aspect-square relative perspective-1000"
          >
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front (Hidden) */}
              <div className="absolute inset-0 bg-indigo-600 rounded-2xl flex items-center justify-center backface-hidden shadow-lg border-4 border-white">
                <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Back (Revealed) */}
              <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center backface-hidden rotate-y-180 shadow-lg border-2 border-slate-100">
                <img
                  src={card.pokemon.sprite}
                  alt="Pokemon"
                  className={`w-16 h-16 pixelated ${card.isMatched ? 'opacity-50' : ''}`}
                />
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {matches === 8 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-6 bg-emerald-50 rounded-2xl text-center border-2 border-emerald-100"
        >
          <h3 className="text-2xl font-black text-emerald-800 mb-2">Parabéns!</h3>
          <p className="text-emerald-600 font-medium">Você completou o jogo em {moves} movimentos.</p>
        </motion.div>
      )}
    </div>
  );
};
