import React, { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WhosThatPokemon } from './components/WhosThatPokemon';
import { PokemonClicker } from './components/PokemonClicker';
import { Pokedex } from './components/Pokedex';
import { MemoryGame } from './components/MemoryGame';
import { QuickBattle } from './components/QuickBattle';
import { PokemonQuiz } from './components/PokemonQuiz';
import { PokemonHunt } from './components/PokemonHunt';
import { PokemonFusion } from './components/PokemonFusion';
import { PokemonRoulette } from './components/PokemonRoulette';
import { Achievements } from './components/Achievements';
import { useSound } from './hooks/useSound';
import { useProgress } from './hooks/useProgress';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, MousePointer2, BookOpen, Brain, Sword, 
  Github, Twitter, Volume2, VolumeX, Music, 
  HelpCircle, Target, FlaskConical, RotateCw,
  Trophy, Star, X
} from 'lucide-react';

type GameId = 'whos-that' | 'clicker' | 'pokedex' | 'memory' | 'battle' | 'quiz' | 'hunt' | 'fusion' | 'roulette' | 'achievements' | null;

interface GameCard {
  id: GameId;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  accent: string;
}

const GAMES: GameCard[] = [
  {
    id: 'whos-that',
    title: 'Adivinhe o Pokémon',
    description: 'Identifique o Pokémon pela sua silhueta.',
    icon: <Brain className="w-8 h-8" />,
    color: 'bg-indigo-500',
    accent: 'text-indigo-600'
  },
  {
    id: 'clicker',
    title: 'Capture Clicker',
    description: 'Capture Pokémon e descubra raridades.',
    icon: <MousePointer2 className="w-8 h-8" />,
    color: 'bg-emerald-500',
    accent: 'text-emerald-600'
  },
  {
    id: 'battle',
    title: 'Batalha Pokémon',
    description: 'Combate clássico por turnos.',
    icon: <Sword className="w-8 h-8" />,
    color: 'bg-red-500',
    accent: 'text-red-600'
  },
  {
    id: 'quiz',
    title: 'Pokémon Quiz',
    description: 'Teste seus conhecimentos sobre nomes.',
    icon: <HelpCircle className="w-8 h-8" />,
    color: 'bg-cyan-500',
    accent: 'text-cyan-600'
  },
  {
    id: 'hunt',
    title: 'Caça ao Pokémon',
    description: 'Seja rápido e clique neles!',
    icon: <Target className="w-8 h-8" />,
    color: 'bg-lime-500',
    accent: 'text-lime-600'
  },
  {
    id: 'fusion',
    title: 'Pokémon Fusion',
    description: 'Combine dois Pokémon e veja o resultado.',
    icon: <FlaskConical className="w-8 h-8" />,
    color: 'bg-pink-500',
    accent: 'text-pink-600'
  },
  {
    id: 'roulette',
    title: 'Roleta Pokémon',
    description: 'Gaste pontos para ganhar Pokémon raros.',
    icon: <RotateCw className="w-8 h-8" />,
    color: 'bg-amber-500',
    accent: 'text-amber-600'
  },
  {
    id: 'pokedex',
    title: 'Pokédex Completa',
    description: 'Veja seu progresso e informações.',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'bg-slate-500',
    accent: 'text-slate-600'
  },
  {
    id: 'memory',
    title: 'Jogo da Memória',
    description: 'Encontre os pares de sprites.',
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'bg-purple-500',
    accent: 'text-purple-600'
  },
  {
    id: 'achievements',
    title: 'Conquistas',
    description: 'Veja seus troféus e marcos.',
    icon: <Star className="w-8 h-8" />,
    color: 'bg-amber-400',
    accent: 'text-amber-600'
  }
];

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const { isMuted, toggleMute, volume, updateVolume, startBGM, stopBGM, playSound, setIntensity } = useSound();
  const { progress, notifications, removeNotification } = useProgress();
  const level = Math.floor(progress.score / 1000) + 1;

  useEffect(() => {
    if (!isMuted) {
      setIntensity(1.0);
      if (!activeGame) {
        startBGM('menu');
      } else if (activeGame === 'battle') {
        startBGM('battle');
      } else {
        startBGM('minigame');
      }
    } else {
      stopBGM();
    }
  }, [isMuted, activeGame, startBGM, stopBGM, setIntensity]);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      playSound('secret');
      setLogoClicks(0);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#6366f1', '#f59e0b', '#10b981']
      });
    } else {
      playSound('click');
    }
  };

  const handleGameSelect = (id: GameId) => {
    setActiveGame(id);
    playSound('click');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] selection:bg-pink-900/30 selection:text-pink-200">
        {/* Notification Overlay */}
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-pink-500/30 p-4 flex items-center gap-4 min-w-[300px]"
              >
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Conquista Desbloqueada!</p>
                  <h4 className="font-black text-slate-100 text-sm">{notif.title}</h4>
                </div>
                <button 
                  onClick={() => removeNotification(notif.id)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4 cursor-pointer select-none"
            onClick={handleLogoClick}
          >
            <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-900/50 relative group">
              <div className="absolute inset-0 bg-pink-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <Gamepad2 className="w-7 h-7 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">PokéFun</h1>
          </motion.div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
             <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl shadow-sm border border-slate-800">
               <Star className="w-4 h-4 text-pink-500" />
               <span className="font-bold text-slate-200">Nv. {level}</span>
             </div>
             <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl shadow-sm border border-slate-800">
               <Trophy className="w-4 h-4 text-amber-500" />
               <span className="font-mono text-slate-200">{progress.score} pts</span>
             </div>
             <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl shadow-sm border border-slate-800">
               <BookOpen className="w-4 h-4 text-emerald-500" />
               <span className="text-slate-200">{progress.capturedIds.length}/151</span>
             </div>
             <button 
               onClick={() => setActiveGame('achievements')}
               className="flex items-center gap-2 bg-pink-900/20 text-pink-400 px-4 py-2 rounded-xl shadow-sm border border-pink-900/50 hover:bg-pink-900/30 transition-colors"
             >
               <Trophy className="w-4 h-4" />
               <span>{progress.achievements.length} Conquistas</span>
             </button>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-2xl shadow-sm border border-slate-800">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => updateVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          <button 
            onClick={() => { toggleMute(); playSound('click'); }}
            onMouseEnter={() => playSound('hover')}
            className="p-3 bg-slate-900/50 rounded-2xl shadow-sm border border-slate-800 hover:shadow-md transition-all text-slate-400 hover:text-pink-400"
            title={isMuted ? "Ativar Som" : "Desativar Som"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => { startBGM(activeGame === 'battle' ? 'battle' : activeGame ? 'minigame' : 'menu'); playSound('click'); }}
            onMouseEnter={() => playSound('hover')}
            className="p-3 bg-slate-900/50 rounded-2xl shadow-sm border border-slate-800 hover:shadow-md transition-all text-slate-400 hover:text-pink-400"
            title="Tocar Música"
          >
            <Music className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-slate-800 mx-2" />
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            onMouseEnter={() => playSound('hover')}
            className="p-3 bg-slate-900/50 rounded-2xl shadow-sm border border-slate-800 hover:shadow-md transition-all text-slate-400 hover:text-pink-400"
          >
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {GAMES.map((game, index) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleGameSelect(game.id)}
                  onMouseEnter={() => playSound('hover')}
                  className="group relative bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border border-slate-800 text-left hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-5 rounded-bl-full transition-transform group-hover:scale-150 duration-700`} />
                  
                  <div className={`w-16 h-16 ${game.color} rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                    {game.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:translate-x-1 transition-transform tracking-tight">{game.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{game.description}</p>
                  
                  <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={game.accent}>Jogar Agora</span>
                    <Sword className={`w-4 h-4 ${game.accent}`} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-8"
            >
              <button
                onClick={() => { setActiveGame(null); playSound('click'); }}
                className="flex items-center gap-2 text-slate-500 hover:text-pink-400 font-bold transition-colors group"
              >
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 group-hover:border-pink-500/30 transition-colors">
                  ←
                </div>
                Voltar para o Início
              </button>

              <div className="min-h-[600px]">
                {activeGame === 'whos-that' && <WhosThatPokemon />}
                {activeGame === 'clicker' && <PokemonClicker />}
                {activeGame === 'pokedex' && <Pokedex />}
                {activeGame === 'memory' && <MemoryGame />}
                {activeGame === 'battle' && <QuickBattle />}
                {activeGame === 'quiz' && <PokemonQuiz />}
                {activeGame === 'hunt' && <PokemonHunt />}
                {activeGame === 'fusion' && <PokemonFusion />}
                {activeGame === 'roulette' && <PokemonRoulette />}
                {activeGame === 'achievements' && <Achievements />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 font-medium text-sm">
        <p>© 2026 PokéFun - Inspirado em neal.fun</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-pink-400 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-pink-400 transition-colors">Termos</a>
          <a href="#" className="hover:text-pink-400 transition-colors">Contato</a>
        </div>
      </footer>
    </div>
  );
}
