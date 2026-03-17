import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_LIST, Pokemon, TYPE_CHART } from '../constants';
import { useSound } from '../hooks/useSound';
import { useProgress } from '../hooks/useProgress';
import { Sword, Zap, Shield, Flame, Zap as ZapIcon, RefreshCw, Trophy } from 'lucide-react';

interface StatusEffect {
  type: 'burn' | 'paralysis';
  duration: number;
}

interface BattleState {
  playerHp: number;
  enemyHp: number;
  playerStatus: StatusEffect | null;
  enemyStatus: StatusEffect | null;
  playerEnergy: number;
  enemyEnergy: number;
  cooldowns: { [key: string]: number };
}

export const QuickBattle = () => {
  const [player, setPlayer] = useState<Pokemon | null>(null);
  const [enemy, setEnemy] = useState<Pokemon | null>(null);
  const [state, setState] = useState<BattleState>({
    playerHp: 100,
    enemyHp: 100,
    playerStatus: null,
    enemyStatus: null,
    playerEnergy: 0,
    enemyEnergy: 0,
    cooldowns: { strong: 0, special: 0 }
  });
  
  const [log, setLog] = useState<string[]>(['A batalha começou!']);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [gameOver, setGameOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; x: number; y: number; type: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const { playSound, setIntensity } = useSound();
  const { capturePokemon, addScore, incrementStat } = useProgress();

  const startBattle = useCallback(() => {
    const p = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
    const e = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
    setPlayer(p);
    setEnemy(e);
    setState({
      playerHp: 100,
      enemyHp: 100,
      playerStatus: null,
      enemyStatus: null,
      playerEnergy: 0,
      enemyEnergy: 0,
      cooldowns: { strong: 0, special: 0 }
    });
    const msg = `Um ${e.name} selvagem apareceu! Vai, ${p.name}!`;
    setLog([msg]);
    setCurrentMessage(msg);
    setTurn('player');
    setGameOver(false);
    setIntensity(1.0);
  }, [setIntensity]);

  useEffect(() => {
    startBattle();
  }, [startBattle]);

  // Music intensity logic
  useEffect(() => {
    if (gameOver) return;
    const lowestHp = Math.min(state.playerHp, state.enemyHp);
    if (lowestHp < 30) setIntensity(1.8);
    else if (lowestHp < 60) setIntensity(1.4);
    else setIntensity(1.0);
  }, [state.playerHp, state.enemyHp, gameOver, setIntensity]);

  // Cooldown and Status logic
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        cooldowns: {
          strong: Math.max(0, prev.cooldowns.strong - 1),
          special: Math.max(0, prev.cooldowns.special - 1)
        }
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const addDamageNumber = (value: number, side: 'player' | 'enemy', type: string) => {
    const id = Date.now();
    const x = side === 'enemy' ? 100 : -100;
    setDamageNumbers(prev => [...prev, { id, value, x, y: -50, type }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1000);
  };

  const calculateDamage = (attacker: Pokemon, defender: Pokemon, baseDamage: number) => {
    let multiplier = 1;
    const attackerType = attacker.type || 'normal';
    const defenderType = defender.type || 'normal';

    if (TYPE_CHART[attackerType]?.strengths?.includes(defenderType)) multiplier = 1.5;
    if (TYPE_CHART[attackerType]?.weaknesses?.includes(defenderType)) multiplier = 0.5;

    return {
      damage: Math.floor(baseDamage * multiplier * (0.9 + Math.random() * 0.2)),
      multiplier
    };
  };

  const updateLog = (msg: string) => {
    setLog(prev => [msg, ...prev]);
    setCurrentMessage(msg);
  };

  const handleAttack = (type: 'fast' | 'strong' | 'special') => {
    if (turn !== 'player' || gameOver) return;
    if (type === 'strong' && state.cooldowns.strong > 0) return;
    if (type === 'special' && state.cooldowns.special > 0) return;

    // Paralysis check
    if (state.playerStatus?.type === 'paralysis' && Math.random() > 0.7) {
      updateLog(`${player?.name} está paralisado e não conseguiu atacar!`);
      setTurn('enemy');
      setTimeout(enemyTurn, 1500);
      return;
    }

    let baseDamage = 10;
    let energyGain = 10;
    let cooldown = 0;
    let statusChance = 0;
    let statusType: 'burn' | 'paralysis' | null = null;

    if (type === 'strong') {
      baseDamage = 25;
      energyGain = 20;
      cooldown = 5;
    } else if (type === 'special') {
      baseDamage = 45;
      energyGain = 0;
      cooldown = 10;
      statusChance = 0.4;
      statusType = Math.random() > 0.5 ? 'burn' : 'paralysis';
    }

    const { damage, multiplier } = calculateDamage(player!, enemy!, baseDamage);
    
    // Dodge check
    if (Math.random() < 0.1) {
      updateLog(`${enemy?.name} desviou do ataque!`);
      playSound('hover');
    } else {
      const newEnemyHp = Math.max(0, state.enemyHp - damage);
      const newEnemyStatus = (statusType && Math.random() < statusChance) ? { type: statusType, duration: 3 } : state.enemyStatus;
      
      setState(prev => ({
        ...prev,
        enemyHp: newEnemyHp,
        enemyStatus: newEnemyStatus,
        playerEnergy: Math.min(100, prev.playerEnergy + energyGain),
        cooldowns: { ...prev.cooldowns, [type]: cooldown }
      }));

      addDamageNumber(damage, 'enemy', multiplier > 1 ? 'super' : multiplier < 1 ? 'weak' : 'normal');
      updateLog(`${player?.name} usou ${type === 'fast' ? 'Investida' : type === 'strong' ? 'Ataque Forte' : 'Ataque Especial'}! ${multiplier > 1 ? 'É super efetivo!' : multiplier < 1 ? 'Não é muito efetivo...' : ''}`);
      playSound(type === 'special' ? 'damage-super' : 'damage-normal');
      triggerShake();

      if (newEnemyHp === 0) {
        setTimeout(handleVictory, 1000);
        return;
      }
    }

    setTurn('enemy');
    setTimeout(enemyTurn, 1500);
  };

  const enemyTurn = () => {
    if (gameOver) return;

    // Burn damage
    if (state.enemyStatus?.type === 'burn') {
      setState(prev => ({ ...prev, enemyHp: Math.max(0, prev.enemyHp - 5) }));
      updateLog(`${enemy?.name} sofreu dano de queimadura!`);
    }

    // AI Logic
    const canUseSpecial = Math.random() > 0.7;
    const { damage, multiplier } = calculateDamage(enemy!, player!, canUseSpecial ? 30 : 15);
    
    if (Math.random() < 0.15) {
      updateLog(`${player?.name} desviou do ataque!`);
    } else {
      const newPlayerHp = Math.max(0, state.playerHp - damage);
      setState(prev => ({ ...prev, playerHp: newPlayerHp }));
      addDamageNumber(damage, 'player', multiplier > 1 ? 'super' : multiplier < 1 ? 'weak' : 'normal');
      updateLog(`${enemy?.name} usou Contra-Ataque!`);
      playSound('damage-normal');
      triggerShake();

      if (newPlayerHp === 0) {
        setGameOver(true);
        updateLog(`${player?.name} desmaiou! Você perdeu...`);
        playSound('defeat');
        return;
      }
    }

    setTurn('player');
  };

  const handleVictory = () => {
    setGameOver(true);
    updateLog(`${enemy?.name} desmaiou! Você venceu!`);
    playSound('victory');
    addScore(500);
    incrementStat('battlesWon');
    
    // Capture chance
    if (Math.random() > 0.4) {
      capturePokemon(enemy!.id, enemy!.rarity, 'battle');
      setTimeout(() => updateLog(`Você capturou o ${enemy?.name}!`), 1000);
      playSound('capture', enemy?.rarity);
    }
  };

  if (!player || !enemy) return null;

  return (
    <div className="max-w-md mx-auto p-2 font-mono">
      <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-pink-900/50 overflow-hidden relative transition-transform duration-75">
        
        {/* Battle Screen Area - Modern Retro Style */}
        <div className={`relative min-h-[320px] p-6 flex flex-col justify-between overflow-hidden transition-transform duration-75 ${isShaking ? 'translate-x-1' : ''}`}>
          {/* Background Gradient - Modern touch */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/20 to-purple-900/20 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          {/* Top: Enemy Info and Sprite */}
          <div className="relative flex justify-between items-start z-10">
            {/* Enemy Info Box - Modern GB Style */}
            <div className="bg-slate-900/90 backdrop-blur-sm border-4 border-pink-900/50 p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] w-52">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-xs uppercase tracking-tighter text-pink-200">{enemy.name}</span>
                <span className="text-[10px] font-black text-pink-500/70">Lv50</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-pink-400">HP</span>
                <div className="flex-1 h-3 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${state.enemyHp}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${state.enemyHp > 50 ? 'bg-emerald-400' : state.enemyHp > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                  />
                </div>
              </div>
              {state.enemyStatus && (
                <div className="mt-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase ${state.enemyStatus.type === 'burn' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {state.enemyStatus.type === 'burn' ? 'BRN' : 'PAR'}
                  </span>
                </div>
              )}
            </div>

            {/* Enemy Sprite */}
            <div className="relative mt-4">
              <motion.img
                animate={turn === 'enemy' ? { 
                  x: [-5, 5, -5],
                  scale: [1, 1.05, 1]
                } : { y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                src={enemy.sprite}
                className="w-28 h-28 pixelated drop-shadow-xl"
              />
              <AnimatePresence>
                {damageNumbers.filter(d => d.x > 0).map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -60, scale: 1.5 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-2xl text-red-600 z-50"
                  >
                    -{d.value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom: Player Info and Sprite */}
          <div className="relative flex justify-between items-end z-10">
            {/* Player Sprite (Back View) */}
            <div className="relative mb-2">
              <motion.img
                animate={turn === 'player' ? { 
                  x: [5, -5, 5],
                  scale: [1, 1.05, 1]
                } : { y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${player.id}.png`}
                className="w-36 h-36 pixelated drop-shadow-xl"
              />
              <AnimatePresence>
                {damageNumbers.filter(d => d.x < 0).map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -60, scale: 1.5 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-2xl text-red-600 z-50"
                  >
                    -{d.value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Player Info Box */}
            <div className="bg-slate-900/90 backdrop-blur-sm border-4 border-pink-900/50 p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] w-52 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-xs uppercase tracking-tighter text-pink-200">{player.name}</span>
                <span className="text-[10px] font-black text-pink-500/70">Lv50</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-pink-400">HP</span>
                <div className="flex-1 h-3 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${state.playerHp}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${state.playerHp > 50 ? 'bg-emerald-400' : state.playerHp > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                {state.playerStatus ? (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase ${state.playerStatus.type === 'burn' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {state.playerStatus.type === 'burn' ? 'BRN' : 'PAR'}
                  </span>
                ) : <div />}
                <span className="text-[10px] font-black text-pink-200/80">{state.playerHp}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message and Action Area */}
        <div className="bg-slate-950 p-4 border-t-8 border-pink-900/50">
          {/* Message Box */}
          <div className="bg-slate-900 border-4 border-pink-900/30 p-4 rounded-2xl min-h-[100px] mb-4 relative shadow-inner">
            <p className="text-sm font-black leading-tight uppercase text-pink-100">
              {currentMessage}
            </p>
            {!gameOver && turn === 'player' && (
              <motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="absolute bottom-3 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-400"
              />
            )}
          </div>

          {/* Action Menu */}
          <div className="grid grid-cols-2 gap-3">
            {!gameOver ? (
              <>
                <GBButton 
                  label="INVESTIDA" 
                  sub="RÁPIDO"
                  disabled={turn !== 'player'} 
                  onClick={() => handleAttack('fast')} 
                  color="indigo"
                />
                <GBButton 
                  label="FORTE" 
                  sub={state.cooldowns.strong > 0 ? `${state.cooldowns.strong}S` : "DANO+"}
                  disabled={turn !== 'player' || state.cooldowns.strong > 0} 
                  onClick={() => handleAttack('strong')} 
                  color="amber"
                />
                <GBButton 
                  label="ESPECIAL" 
                  sub={state.cooldowns.special > 0 ? `${state.cooldowns.special}S` : "STATUS"}
                  disabled={turn !== 'player' || state.cooldowns.special > 0} 
                  onClick={() => handleAttack('special')} 
                  color="red"
                />
                <GBButton 
                  label="FUGIR" 
                  sub="SAIR"
                  disabled={turn !== 'player'} 
                  onClick={() => setGameOver(true)} 
                  color="slate"
                />
              </>
            ) : (
              <div className="col-span-2">
                <GBButton 
                  label="NOVA BATALHA" 
                  onClick={startBattle} 
                  className="w-full py-4"
                  color="emerald"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GBButton = ({ label, sub, disabled, onClick, className = "", color = "slate" }: any) => {
  const colors: any = {
    indigo: 'bg-pink-900/20 text-pink-400 border-pink-900/50 hover:bg-pink-900/30',
    amber: 'bg-amber-900/20 text-amber-400 border-amber-900/50 hover:bg-amber-900/30',
    red: 'bg-red-900/20 text-red-400 border-red-900/50 hover:bg-red-900/30',
    slate: 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700',
    emerald: 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`border-4 p-3 rounded-2xl font-black text-xs uppercase active:scale-95 disabled:opacity-30 transition-all flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] ${colors[color]} ${className}`}
    >
      <span>{label}</span>
      {sub && <span className="text-[9px] opacity-60 mt-0.5 font-bold tracking-widest">{sub}</span>}
    </button>
  );
};

const HpBar = ({ hp }: { hp: number }) => (
  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
    <motion.div
      initial={{ width: '100%' }}
      animate={{ width: `${hp}%` }}
      className={`h-full rounded-full transition-all duration-500 ${hp > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : hp > 20 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
    />
  </div>
);

const ActionButton = ({ label, sub, icon, color, disabled, onClick }: any) => {
  const colors: any = {
    slate: 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200',
    orange: 'bg-orange-600 border-orange-400 hover:bg-orange-700 text-white',
    red: 'bg-red-600 border-red-400 hover:bg-red-700 text-white',
    emerald: 'bg-emerald-600 border-emerald-400 hover:bg-emerald-700 text-white',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale group ${colors[color]}`}
    >
      <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-black text-xs uppercase tracking-tight">{label}</p>
        <p className="text-[9px] opacity-70 font-bold uppercase truncate max-w-[80px]">{sub}</p>
      </div>
    </button>
  );
};
