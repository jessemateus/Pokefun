import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Progress {
  capturedIds: number[];
  score: number;
  achievements: string[];
  stats: {
    clickerCaptures: number;
    battlesWon: number;
    memoryGamesWon: number;
    totalCaptures: number;
    battleStreak: number;
    maxCombo: number;
    playTime: number; // in seconds
    shinyCaptures: number;
    legendaryCaptures: number;
    rareCaptures: number;
  };
  lastUpdate: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ProgressContextType {
  progress: Progress;
  capturePokemon: (id: number, rarity?: string, source?: string) => void;
  addScore: (amount: number) => void;
  isCaptured: (id: number) => boolean;
  unlockAchievement: (id: string) => void;
  incrementStat: (stat: keyof Progress['stats'], value?: number) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [progress, setProgress] = useState<Progress>(() => {
    const saved = localStorage.getItem('poke_progress');
    const defaultProgress = { 
      capturedIds: [], 
      score: 0, 
      achievements: [],
      stats: {
        clickerCaptures: 0,
        battlesWon: 0,
        memoryGamesWon: 0,
        totalCaptures: 0,
        battleStreak: 0,
        maxCombo: 0,
        playTime: 0,
        shinyCaptures: 0,
        legendaryCaptures: 0,
        rareCaptures: 0
      },
      lastUpdate: Date.now()
    };
    if (!saved) return defaultProgress;
    const parsed = JSON.parse(saved);
    // Merge with defaults to handle new fields
    return {
      ...defaultProgress,
      ...parsed,
      stats: { ...defaultProgress.stats, ...parsed.stats }
    };
  });

  useEffect(() => {
    localStorage.setItem('poke_progress', JSON.stringify(progress));
  }, [progress]);

  // Track play time
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newPlayTime = prev.stats.playTime + 10;
        let newAchievements = [...prev.achievements];
        if (newPlayTime >= 3600 && !newAchievements.includes('addicted')) {
          newAchievements.push('addicted');
          addNotification('addicted');
        }
        return {
          ...prev,
          stats: { ...prev.stats, playTime: newPlayTime }
        };
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (achievementId: string) => {
    import('../constants').then(({ ACHIEVEMENTS }) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { ...achievement, id }]);
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
      }
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const capturePokemon = (id: number, rarity: string = 'common', source?: string) => {
    setProgress(prev => {
      const isNew = !prev.capturedIds.includes(id);
      const newCapturedIds = isNew ? [...prev.capturedIds, id] : prev.capturedIds;
      
      let newStats = { ...prev.stats };
      newStats.totalCaptures += 1;
      if (source === 'clicker') {
        newStats.clickerCaptures += 1;
      }
      if (rarity === 'shiny') newStats.shinyCaptures += 1;
      if (rarity === 'legendary') newStats.legendaryCaptures += 1;
      if (rarity === 'rare') newStats.rareCaptures += 1;

      // Check for achievements
      let newAchievements = [...prev.achievements];
      const checkAndUnlock = (aid: string) => {
        if (!newAchievements.includes(aid)) {
          newAchievements.push(aid);
          addNotification(aid);
        }
      };

      if (isNew && newCapturedIds.length === 1) checkAndUnlock('first_capture');
      if (newStats.totalCaptures >= 50) checkAndUnlock('hunter_50');
      if (newStats.totalCaptures >= 200) checkAndUnlock('pokedex_master');
      if (rarity === 'rare') checkAndUnlock('lucky_rare');
      if (rarity === 'legendary') checkAndUnlock('living_legend');
      if (rarity === 'shiny') checkAndUnlock('miracle_shiny');
      if (newCapturedIds.length >= 100) checkAndUnlock('collector');

      return {
        ...prev,
        capturedIds: newCapturedIds,
        score: prev.score + (isNew ? 100 : 10),
        achievements: newAchievements,
        stats: newStats
      };
    });
  };

  const addScore = (amount: number) => {
    setProgress(prev => ({ ...prev, score: prev.score + amount }));
  };

  const unlockAchievement = (id: string) => {
    setProgress(prev => {
      if (prev.achievements.includes(id)) return prev;
      addNotification(id);
      return { ...prev, achievements: [...prev.achievements, id] };
    });
  };

  const incrementStat = (stat: keyof Progress['stats'], value: number = 1) => {
    setProgress(prev => {
      const newStats = { ...prev.stats, [stat]: prev.stats[stat] + value };
      let newAchievements = [...prev.achievements];
      const checkAndUnlock = (aid: string) => {
        if (!newAchievements.includes(aid)) {
          newAchievements.push(aid);
          addNotification(aid);
        }
      };
      
      if (stat === 'battlesWon' && newStats.battlesWon >= 1) checkAndUnlock('first_win');
      if (stat === 'battleStreak' && newStats.battleStreak >= 5) checkAndUnlock('invincible_5');
      if (stat === 'maxCombo' && newStats.maxCombo >= 10) checkAndUnlock('combo_master');

      return { ...prev, stats: newStats, achievements: newAchievements };
    });
  };

  const isCaptured = (id: number) => progress.capturedIds.includes(id);

  return (
    <ProgressContext.Provider value={{ 
      progress, 
      capturePokemon, 
      addScore, 
      isCaptured, 
      unlockAchievement, 
      incrementStat,
      notifications,
      removeNotification
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
};
