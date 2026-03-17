import { motion } from 'motion/react';
import { ACHIEVEMENTS, Achievement } from '../constants';
import { useProgress } from '../hooks/useProgress';
import { useSound } from '../hooks/useSound';
import { Trophy, CheckCircle2, Circle, Star, Target, Zap, Sword, Shield, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_ICONS: Record<string, any> = {
  capture: <Target className="w-5 h-5" />,
  rarity: <Star className="w-5 h-5" />,
  clicker: <Zap className="w-5 h-5" />,
  battle: <Sword className="w-5 h-5" />,
  progress: <Shield className="w-5 h-5" />,
  secret: <HelpCircle className="w-5 h-5" />,
};

const CATEGORY_NAMES: Record<string, string> = {
  capture: 'Captura',
  rarity: 'Raridade',
  clicker: 'Clicker',
  battle: 'Batalha',
  progress: 'Progresso',
  secret: 'Segredos',
};

export const Achievements = () => {
  const { progress } = useProgress();
  const { playSound } = useSound();
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const filteredAchievements = ACHIEVEMENTS.filter(a => 
    activeCategory === 'all' ? true : a.category === activeCategory
  );

  const getCategoryProgress = (category: string) => {
    const total = ACHIEVEMENTS.filter(a => a.category === category).length;
    const unlocked = ACHIEVEMENTS.filter(a => a.category === category && progress.achievements.includes(a.id)).length;
    return (unlocked / total) * 100;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-8 max-w-5xl mx-auto border-2 border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-900/20 rounded-2xl flex items-center justify-center shadow-inner border border-amber-900/30">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Conquistas</h2>
            <p className="text-slate-400 font-medium">Seu legado como Mestre Pokémon.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CategoryTab 
            active={activeCategory === 'all'} 
            onClick={() => setActiveCategory('all')}
            label="Todas"
          />
          {Object.keys(CATEGORY_NAMES).map(cat => (
            <CategoryTab 
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={CATEGORY_NAMES[cat]}
              icon={CATEGORY_ICONS[cat]}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = progress.achievements.includes(achievement.id);
          const isSecret = achievement.category === 'secret' && !isUnlocked;
          
          return (
            <motion.div
              layout
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onMouseEnter={() => playSound('hover')}
              className={`p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-amber-900/20 to-slate-900 border-amber-900/50 shadow-md' 
                  : 'bg-slate-950 border-slate-900 opacity-40'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full flex items-start justify-end p-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`text-4xl transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-125' : 'grayscale'}`}>
                  {isSecret ? '❓' : achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-black text-sm mb-1 ${isUnlocked ? 'text-amber-200' : 'text-slate-600'}`}>
                    {isSecret ? '???' : achievement.title}
                  </h3>
                  <p className={`text-[11px] font-medium leading-relaxed ${isUnlocked ? 'text-amber-500/80' : 'text-slate-500'}`}>
                    {isSecret ? 'Continue explorando para descobrir...' : achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-950/50 rounded-[2rem] border-2 border-slate-800">
        <div>
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Progresso Geral</h4>
          <div className="flex items-end gap-4 mb-2">
            <span className="text-4xl font-black text-pink-500">
              {Math.round((progress.achievements.length / ACHIEVEMENTS.length) * 100)}%
            </span>
            <span className="text-sm font-bold text-slate-500 mb-1">
              {progress.achievements.length} de {ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-1 shadow-inner border border-slate-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(progress.achievements.length / ACHIEVEMENTS.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.keys(CATEGORY_NAMES).map(cat => (
            <div key={cat}>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                <span>{CATEGORY_NAMES[cat]}</span>
                <span>{Math.round(getCategoryProgress(cat))}%</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getCategoryProgress(cat)}%` }}
                  className="h-full bg-slate-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryTab = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
      active 
        ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 scale-105' 
        : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
    }`}
  >
    {icon}
    {label}
  </button>
);
