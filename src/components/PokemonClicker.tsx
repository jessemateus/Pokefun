import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon, RARITY_COLORS } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';
import { MousePointer2, Zap, Trophy, Sparkles, Target, Timer, TrendingUp, Star } from 'lucide-react';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
}

export const PokemonClicker = () => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [captureRateBonus, setCaptureRateBonus] = useState(0);
  const [rareChanceBonus, setRareChanceBonus] = useState(0);
  
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon>(POKEMON_LIST[0]);
  const [isShiny, setIsShiny] = useState(false);
  const [combo, setCombo] = useState(0);
  const [effects, setEffects] = useState<ClickEffect[]>([]);
  const [eventPokemon, setEventPokemon] = useState<Pokemon | null>(null);
  
  const lastClickTime = useRef<number>(0);
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { playSound } = useSound();
  const { capturePokemon, addScore, incrementStat } = useProgress();

  // Auto-clicker logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickers > 0) {
        const gain = autoClickers * multiplier;
        setCount(prev => prev + gain);
        addScore(gain);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autoClickers, multiplier]);

  // Combo reset logic
  useEffect(() => {
    if (combo > 0) {
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      comboTimeout.current = setTimeout(() => {
        setCombo(0);
      }, 2000);
    }
    return () => {
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
    };
  }, [combo]);

  // Random event logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!eventPokemon && Math.random() > 0.95) {
        const pool = POKEMON_LIST.filter(p => p.rarity === 'legendary' || p.rarity === 'rare');
        const p = pool[Math.floor(Math.random() * pool.length)];
        setEventPokemon(p);
        playSound('shiny');
        setTimeout(() => setEventPokemon(null), 5000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [eventPokemon]);

  const getRarityMultiplier = (rarity: string) => {
    switch (rarity) {
      case 'shiny': return 50;
      case 'legendary': return 25;
      case 'rare': return 10;
      case 'uncommon': return 5;
      default: return 1;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const isCritical = Math.random() > 0.9;
    const comboBonus = Math.floor(combo / 5);
    const baseGain = multiplier * (isCritical ? 3 : 1);
    const totalGain = baseGain + comboBonus;

    setCount(prev => prev + totalGain);
    addScore(totalGain);
    playSound('click');

    // Update combo
    setCombo(prev => {
      const next = prev + 1;
      if (next >= 10) incrementStat('maxCombo', next);
      return next;
    });

    // Visual effect
    const newEffect: ClickEffect = {
      id: now,
      x: e.clientX,
      y: e.clientY,
      value: totalGain,
      isCritical
    };
    setEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setEffects(prev => prev.filter(eff => eff.id !== newEffect.id));
    }, 1000);

    // Capture logic
    const baseCaptureChance = 0.02 + (captureRateBonus * 0.01);
    const rarityMod = currentPokemon.rarity === 'legendary' ? 0.1 : currentPokemon.rarity === 'rare' ? 0.3 : 0.6;
    const finalChance = baseCaptureChance * rarityMod * (isShiny ? 0.5 : 1);

    if (Math.random() < finalChance) {
      capturePokemon(currentPokemon.id, isShiny ? 'shiny' : currentPokemon.rarity, 'clicker');
      playSound('capture', currentPokemon.rarity);
      
      // Change pokemon after capture
      changePokemon();
    } else if (Math.random() > 0.9) {
      // Small chance to change pokemon even if not captured
      changePokemon();
    }
  };

  const changePokemon = () => {
    const rand = Math.random() + (rareChanceBonus * 0.05);
    let pool = POKEMON_LIST.filter(p => p.rarity === 'common');
    if (rand > 0.98) pool = POKEMON_LIST.filter(p => p.rarity === 'legendary');
    else if (rand > 0.9) pool = POKEMON_LIST.filter(p => p.rarity === 'rare');
    else if (rand > 0.7) pool = POKEMON_LIST.filter(p => p.rarity === 'uncommon');
    
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentPokemon(next);
    setIsShiny(Math.random() > 0.98);
  };

  const handleEventClick = () => {
    if (eventPokemon) {
      capturePokemon(eventPokemon.id, eventPokemon.rarity, 'clicker');
      playSound('capture', eventPokemon.rarity);
      setEventPokemon(null);
      addScore(500);
    }
  };

  const buyUpgrade = (type: 'multiplier' | 'auto' | 'rate' | 'rare') => {
    let cost = 0;
    switch (type) {
      case 'multiplier': cost = multiplier * 100; break;
      case 'auto': cost = (autoClickers + 1) * 250; break;
      case 'rate': cost = (captureRateBonus + 1) * 500; break;
      case 'rare': cost = (rareChanceBonus + 1) * 1000; break;
    }

    if (count >= cost) {
      setCount(prev => prev - cost);
      switch (type) {
        case 'multiplier': setMultiplier(prev => prev + 1); break;
        case 'auto': setAutoClickers(prev => prev + 1); break;
        case 'rate': setCaptureRateBonus(prev => prev + 1); break;
        case 'rare': setRareChanceBonus(prev => prev + 1); break;
      }
      playSound('success');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Stats & Combo */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recursos
            </h2>
            <div className="space-y-2">
              <p className="text-4xl font-black text-pink-500 font-mono">{count.toLocaleString()}</p>
              <p className="text-xs text-slate-500 font-bold">PONTOS DISPONÍVEIS</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Combo</span>
                <span className="text-2xl font-black text-pink-400">x{combo}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-pink-500"
                  initial={{ width: "100%" }}
                  animate={{ width: combo > 0 ? "0%" : "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  key={combo}
                />
              </div>
              {combo >= 5 && (
                <p className="text-[10px] font-black text-pink-400 text-center animate-bounce">
                  BÔNUS DE COMBO ATIVO! (+{Math.floor(combo/5)})
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-800 text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Estatísticas Ativas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Poder</p>
                <p className="text-xl font-black text-pink-400">x{multiplier}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Auto</p>
                <p className="text-xl font-black text-emerald-400">{autoClickers}/s</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Taxa</p>
                <p className="text-xl font-black text-blue-400">+{captureRateBonus}%</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Sorte</p>
                <p className="text-xl font-black text-amber-400">+{rareChanceBonus}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Main Clicker */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center relative">
          <AnimatePresence>
            {eventPokemon && (
              <motion.button
                initial={{ scale: 0, opacity: 0, x: 100 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleEventClick}
                className="absolute top-0 right-0 z-50 bg-amber-400 p-4 rounded-full shadow-2xl border-4 border-white animate-bounce group"
              >
                <Sparkles className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                  EVENTO RARO!
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="text-center mb-8">
            <motion.div
              key={currentPokemon.id + (isShiny ? 's' : 'n')}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                {isShiny && <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />}
                <p className={`text-sm font-black uppercase tracking-widest ${isShiny ? 'text-pink-500' : RARITY_COLORS[currentPokemon.rarity]}`}>
                  {isShiny ? 'SHINY' : currentPokemon.rarity}
                </p>
                {isShiny && <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />}
              </div>
              <h2 className="text-3xl font-black text-white capitalize tracking-tight">{currentPokemon.name}</h2>
            </motion.div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="relative group"
          >
            {/* Background Glows */}
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40 ${isShiny ? 'bg-pink-400' : currentPokemon.rarity === 'legendary' ? 'bg-amber-400' : 'bg-pink-400'}`} />
            
            <div className="relative w-64 h-64 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-8 border-slate-800 overflow-hidden group-active:border-pink-500/30 transition-colors">
              <motion.img
                key={currentPokemon.id}
                src={currentPokemon.sprite}
                alt={currentPokemon.name}
                className={`w-44 h-44 pixelated relative z-10 transition-all duration-300 ${isShiny ? 'hue-rotate-90 filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                animate={{ 
                  y: [0, -10, 0],
                  scale: combo > 10 ? [1, 1.05, 1] : 1
                }}
                transition={{ 
                  y: { repeat: Infinity, duration: 2 },
                  scale: { repeat: Infinity, duration: 0.5 }
                }}
              />
              
              {/* Pokéball effect on click */}
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 2, opacity: 0.2 }}
                  className="absolute inset-0 bg-red-500 rounded-full pointer-events-none"
                />
              </AnimatePresence>
            </div>
          </motion.button>

          <p className="mt-8 text-slate-400 text-sm font-medium animate-pulse">
            Clique freneticamente para capturar!
          </p>
        </div>

        {/* Right: Upgrades */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4 tracking-tight">
            <Zap className="w-6 h-6 text-yellow-500" /> Upgrades
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <UpgradeButton 
              title="Super Clique"
              desc={`+1 ponto por clique`}
              cost={multiplier * 100}
              level={multiplier}
              icon={<MousePointer2 />}
              color="indigo"
              canBuy={count >= multiplier * 100}
              onClick={() => buyUpgrade('multiplier')}
            />
            <UpgradeButton 
              title="Poké-Bot"
              desc={`+1 ponto por segundo`}
              cost={(autoClickers + 1) * 250}
              level={autoClickers}
              icon={<Timer />}
              color="emerald"
              canBuy={count >= (autoClickers + 1) * 250}
              onClick={() => buyUpgrade('auto')}
            />
            <UpgradeButton 
              title="Rede de Captura"
              desc={`+1% taxa de captura`}
              cost={(captureRateBonus + 1) * 500}
              level={captureRateBonus}
              icon={<Target />}
              color="blue"
              canBuy={count >= (captureRateBonus + 1) * 500}
              onClick={() => buyUpgrade('rate')}
            />
            <UpgradeButton 
              title="Incenso Raro"
              desc={`+5% chance de raros`}
              cost={(rareChanceBonus + 1) * 1000}
              level={rareChanceBonus}
              icon={<Star />}
              color="amber"
              canBuy={count >= (rareChanceBonus + 1) * 1000}
              onClick={() => buyUpgrade('rare')}
            />
          </div>
        </div>
      </div>

      {/* Floating Click Effects */}
      <AnimatePresence>
        {effects.map(eff => (
          <motion.div
            key={eff.id}
            initial={{ opacity: 1, y: eff.y - 20, x: eff.x }}
            animate={{ opacity: 0, y: eff.y - 100 }}
            exit={{ opacity: 0 }}
            className={`fixed pointer-events-none z-[100] font-black text-2xl ${eff.isCritical ? 'text-yellow-500 scale-150' : 'text-indigo-500'}`}
          >
            +{eff.value}
            {eff.isCritical && <span className="text-xs block">CRÍTICO!</span>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const UpgradeButton = ({ title, desc, cost, level, icon, color, canBuy, onClick }: any) => {
  const colors: any = {
    indigo: 'bg-pink-900/20 text-pink-400 border-pink-900/50 hover:border-pink-500/50',
    emerald: 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 hover:border-emerald-500/50',
    blue: 'bg-blue-900/20 text-blue-400 border-blue-900/50 hover:border-blue-500/50',
    amber: 'bg-amber-900/20 text-amber-400 border-amber-900/50 hover:border-amber-500/50',
  };

  return (
    <button
      onClick={onClick}
      disabled={!canBuy}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale group ${colors[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${canBuy ? 'bg-slate-900' : 'bg-slate-950'}`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-100">{title}</p>
          <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-white">{cost.toLocaleString()} pts</p>
        <p className="text-[10px] uppercase font-bold opacity-60 text-slate-400">Nível {level}</p>
      </div>
    </button>
  );
};
