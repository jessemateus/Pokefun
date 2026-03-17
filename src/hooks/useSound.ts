import { useState, useCallback, useEffect, useRef } from 'react';

type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'battle' 
  | 'capture' 
  | 'level-up' 
  | 'hover' 
  | 'victory' 
  | 'defeat' 
  | 'shiny'
  | 'damage-normal'
  | 'damage-super'
  | 'secret';

type BGMType = 'menu' | 'battle' | 'minigame';

// Frequencies for notes
const NOTES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98,
  '0': 0 // Rest
};

interface TrackPattern {
  lead: string[];
  bass: string[];
  perc: boolean[];
  bpm: number;
}

const PATTERNS: Record<BGMType, TrackPattern> = {
  menu: {
    bpm: 110,
    lead: ['C5', '0', 'E5', 'G5', 'C6', '0', 'G5', 'E5', 'D5', '0', 'F5', 'A5', 'D6', '0', 'A5', 'F5'],
    bass: ['C3', 'C3', 'G3', 'G3', 'C3', 'C3', 'G3', 'B2', 'F2', 'F2', 'C3', 'C3', 'F2', 'F2', 'C3', 'G2'],
    perc: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false]
  },
  battle: {
    bpm: 145,
    lead: ['G4', 'G4', 'A#4', 'C5', 'D5', 'D5', 'F5', 'D#5', 'D5', 'C5', 'A#4', 'G4', 'F4', 'G4', 'A4', 'B4'],
    bass: ['G2', 'G2', 'G2', 'G2', 'D2', 'D2', 'D2', 'D2', 'A#1', 'A#1', 'A#1', 'A#1', 'F2', 'F2', 'F2', 'F2'],
    perc: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, true, true]
  },
  minigame: {
    bpm: 128,
    lead: ['E5', 'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'F5', 'A5', 'C6', 'D6', 'E6', 'D6', 'C6', 'A5'],
    bass: ['C3', 'G2', 'C3', 'G2', 'F2', 'C2', 'F2', 'C2', 'G2', 'D2', 'G2', 'D2', 'C3', 'G2', 'C3', 'B2'],
    perc: [true, false, true, false, true, false, true, false, true, false, true, false, true, true, true, true]
  }
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('poke_muted');
    return saved === 'true';
  });

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('poke_volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const currentBgmType = useRef<BGMType | null>(null);
  const intensityRef = useRef<number>(1);
  const schedulerTimerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      localStorage.setItem('poke_muted', String(newVal));
      if (bgmGainRef.current) {
        bgmGainRef.current.gain.setTargetAtTime(newVal ? 0 : volume * 0.15, getAudioCtx().currentTime, 0.1);
      }
      return newVal;
    });
  };

  const updateVolume = (val: number) => {
    setVolume(val);
    localStorage.setItem('poke_volume', String(val));
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.setTargetAtTime(isMuted ? 0 : val * 0.15, getAudioCtx().currentTime, 0.1);
    }
  };

  const playSound = useCallback((type: SoundType, rarity: 'common' | 'uncommon' | 'rare' | 'legendary' = 'common') => {
    if (isMuted) return;
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    let output: AudioNode = masterGain;
    if (rarity === 'legendary') {
      const reverb = ctx.createConvolver();
      const length = ctx.sampleRate * 2;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
          channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
        }
      }
      reverb.buffer = impulse;
      reverb.connect(masterGain);
      output = reverb;
    }

    const createOsc = (freq: number, type: OscillatorType, startTime: number, duration: number, startGain: number) => {
      if (freq === 0) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      g.gain.setValueAtTime(startGain, startTime);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(g);
      g.connect(output);
      osc.start(startTime);
      osc.stop(startTime + duration);
      return osc;
    };

    switch (type) {
      case 'click':
        createOsc(600, 'square', now, 0.05, 0.1);
        createOsc(400, 'square', now + 0.05, 0.05, 0.1);
        break;
      case 'hover':
        createOsc(880, 'sine', now, 0.03, 0.02);
        break;
      case 'success':
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => createOsc(f, 'sine', now + i * 0.06, 0.3, 0.1));
        break;
      case 'error':
        createOsc(150, 'sawtooth', now, 0.2, 0.1);
        createOsc(110, 'sawtooth', now + 0.1, 0.2, 0.1);
        break;
      case 'capture':
        for (let i = 0; i < 4; i++) {
          createOsc(440 + i * 110, 'triangle', now + i * 0.08, 0.15, 0.1);
        }
        break;
      case 'battle':
        createOsc(200, 'sawtooth', now, 0.15, 0.1);
        createOsc(100, 'sawtooth', now + 0.05, 0.15, 0.1);
        break;
      case 'victory':
        [523.25, 523.25, 523.25, 523.25, 698.46, 783.99, 1046.50].forEach((f, i) => 
          createOsc(f, 'square', now + i * 0.12, 0.15, 0.05)
        );
        break;
      case 'defeat':
        [392.00, 349.23, 329.63, 261.63, 196.00].forEach((f, i) => 
          createOsc(f, 'square', now + i * 0.25, 0.3, 0.05)
        );
        break;
      case 'shiny':
        for (let i = 0; i < 15; i++) {
          createOsc(1000 + Math.random() * 3000, 'sine', now + i * 0.04, 0.15, 0.05);
        }
        break;
      case 'damage-normal':
        createOsc(80, 'sawtooth', now, 0.1, 0.2);
        break;
      case 'damage-super':
        createOsc(60, 'sawtooth', now, 0.25, 0.3);
        break;
      case 'secret':
        [880, 1108.73, 1318.51, 1760, 2217.46].forEach((f, i) => 
          createOsc(f, 'sine', now + i * 0.04, 0.4, 0.05)
        );
        break;
    }

    if (rarity !== 'common' && navigator.vibrate) {
      navigator.vibrate(rarity === 'legendary' ? [100, 50, 100] : 50);
    }
  }, [isMuted, volume, getAudioCtx]);

  const playStep = useCallback((type: BGMType, time: number) => {
    const ctx = getAudioCtx();
    const pattern = PATTERNS[type];
    const step = currentStepRef.current % pattern.lead.length;
    const gainNode = bgmGainRef.current;
    if (!gainNode) return;

    const noteDuration = 60 / pattern.bpm / 2;

    const leadNote = pattern.lead[step];
    if (leadNote !== '0') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = intensityRef.current > 1.5 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(NOTES[leadNote] || 0, time);
      g.gain.setValueAtTime(intensityRef.current > 1.5 ? 0.05 : 0.08, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + noteDuration * 0.9);
      osc.connect(g);
      g.connect(gainNode);
      osc.start(time);
      osc.stop(time + noteDuration);
    }

    // Add a second lead layer if intensity is high
    if (intensityRef.current > 1.2 && step % 2 === 0 && leadNote !== '0') {
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime((NOTES[leadNote] || 0) * 2, time); // Octave up
      g2.gain.setValueAtTime(0.03, time);
      g2.gain.exponentialRampToValueAtTime(0.001, time + noteDuration * 0.5);
      osc2.connect(g2);
      g2.connect(gainNode);
      osc2.start(time);
      osc2.stop(time + noteDuration * 0.5);
    }

    const bassNote = pattern.bass[step];
    if (bassNote !== '0') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(NOTES[bassNote] || 0, time);
      g.gain.setValueAtTime(0.12, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + noteDuration * 1.5);
      osc.connect(g);
      g.connect(gainNode);
      osc.start(time);
      osc.stop(time + noteDuration * 1.5);
    }

    if (pattern.perc[step]) {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const g = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(type === 'battle' ? 2000 : 5000, time);
      g.gain.setValueAtTime(type === 'battle' ? 0.05 : 0.02, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      noise.connect(filter);
      filter.connect(g);
      g.connect(gainNode);
      noise.start(time);
    }

    currentStepRef.current++;
  }, [getAudioCtx]);

  const scheduler = useCallback(() => {
    const ctx = getAudioCtx();
    const type = currentBgmType.current;
    if (!type || isMuted) return;

    const pattern = PATTERNS[type];
    const lookahead = 0.1;
    const scheduleInterval = 0.025;
    const noteDuration = 60 / pattern.bpm / 2;

    while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
      playStep(type, nextNoteTimeRef.current);
      nextNoteTimeRef.current += noteDuration;
    }

    schedulerTimerRef.current = window.setTimeout(scheduler, scheduleInterval * 1000);
  }, [getAudioCtx, isMuted, playStep]);

  const startBGM = useCallback((type: BGMType = 'menu') => {
    if (isMuted || currentBgmType.current === type) return;
    
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }

    if (bgmGainRef.current) {
      const oldGain = bgmGainRef.current;
      oldGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => oldGain.disconnect(), 1000);
    }

    currentBgmType.current = type;
    currentStepRef.current = 0;
    nextNoteTimeRef.current = now + 0.1;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.15, now + 1.0);
    gainNode.connect(ctx.destination);
    bgmGainRef.current = gainNode;

    scheduler();
  }, [isMuted, volume, getAudioCtx, scheduler]);

  const stopBGM = useCallback(() => {
    currentBgmType.current = null;
    intensityRef.current = 1;
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.setTargetAtTime(0, getAudioCtx().currentTime, 0.2);
    }
  }, [getAudioCtx]);

  const setIntensity = useCallback((val: number) => {
    intensityRef.current = val;
  }, []);

  useEffect(() => {
    return () => {
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
    };
  }, []);

  return { playSound, isMuted, toggleMute, volume, updateVolume, startBGM, stopBGM, setIntensity };
};
