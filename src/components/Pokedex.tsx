import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon, TYPE_COLORS, RARITY_COLORS } from '../constants';
import { useProgress } from '../hooks/useProgress';
import { useSound } from '../hooks/useSound';
import { Search, Info, X, CheckCircle2 } from 'lucide-react';

export const Pokedex = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const { isCaptured, progress } = useProgress();
  const { playSound } = useSound();

  const filtered = POKEMON_LIST.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-5xl mx-auto min-h-[600px] border-2 border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Pokédex</h2>
          <p className="text-slate-400 font-medium">Você descobriu {progress.capturedIds.length} de 151 Pokémon.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 bg-slate-900 rounded-2xl border-2 border-slate-800 focus:border-pink-500/50 text-white outline-none w-full md:w-80 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((pokemon) => {
          const captured = isCaptured(pokemon.id);
          return (
            <motion.button
              key={pokemon.id}
              layoutId={`pokemon-${pokemon.id}`}
              onClick={() => { setSelected(pokemon); playSound('click'); }}
              onMouseEnter={() => playSound('hover')}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center group transition-all ${
                captured ? 'bg-slate-900/80 border-slate-800 shadow-sm hover:shadow-pink-500/10 hover:border-pink-500/30' : 'bg-slate-950 border-slate-900 opacity-40'
              }`}
            >
              {captured && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
              )}
              <div className="w-24 h-24 bg-slate-950 rounded-xl mb-3 flex items-center justify-center shadow-inner overflow-hidden border border-slate-800">
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name} 
                  className={`w-20 h-20 pixelated group-hover:scale-110 transition-transform ${captured ? '' : 'brightness-0 opacity-20'}`} 
                />
              </div>
              <p className="text-[10px] font-bold text-slate-500 mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
              <p className="font-bold text-slate-200 capitalize truncate w-full text-center">
                {captured ? pokemon.name : '???'}
              </p>
              <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${RARITY_COLORS[pokemon.rarity]}`}>
                {pokemon.rarity}
              </p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              layoutId={`pokemon-${selected.id}`}
              className="bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full relative overflow-hidden border-4 border-pink-500/30"
            >
              <button
                onClick={() => { setSelected(null); playSound('click'); }}
                onMouseEnter={() => playSound('hover')}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors z-20"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>

              <div className="flex flex-col items-center relative z-10">
                <div className="w-48 h-48 bg-slate-950 rounded-3xl mb-6 flex items-center justify-center shadow-inner border border-slate-800">
                  <img 
                    src={selected.sprite} 
                    alt={selected.name} 
                    className={`w-40 h-40 pixelated animate-float ${isCaptured(selected.id) ? '' : 'brightness-0 opacity-20'}`} 
                  />
                </div>
                
                <p className="text-sm font-bold text-pink-500 mb-1">#{String(selected.id).padStart(3, '0')}</p>
                <h3 className="text-3xl font-black text-white capitalize mb-2 tracking-tight">
                  {isCaptured(selected.id) ? selected.name : '???'}
                </h3>
                <p className={`text-xs font-black uppercase tracking-widest mb-4 ${RARITY_COLORS[selected.rarity]}`}>
                  {selected.rarity}
                </p>

                {isCaptured(selected.id) ? (
                  <>
                    <div className="w-full grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Altura</p>
                        <p className="font-bold text-slate-800">0.7 m</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Peso</p>
                        <p className="font-bold text-slate-800">6.9 kg</p>
                      </div>
                    </div>
                    <div className="w-full p-4 bg-indigo-50 rounded-2xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-900 leading-relaxed">
                        Este Pokémon foi capturado! Explore outros mini-jogos para completar sua coleção.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full p-6 bg-slate-100 rounded-2xl text-center">
                    <p className="text-slate-500 font-medium">Ainda não capturado.</p>
                    <p className="text-xs text-slate-400 mt-2">Jogue os mini-jogos para encontrá-lo!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
