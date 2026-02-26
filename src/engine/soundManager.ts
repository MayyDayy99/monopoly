// ============================================================
// SOUND MANAGER — Web Audio API alapú procedurális hangok
// Nem igényel mp3 fájlokat — minden hang szintetizálva van.
// ============================================================

import { useCallback, useEffect, useState } from 'react';

type SoundEffect =
    | 'dice-roll'
    | 'money-gain'
    | 'money-loss'
    | 'buy-property'
    | 'build-house'
    | 'jail'
    | 'card-draw'
    | 'bankruptcy'
    | 'victory'
    | 'turn-change';

let ctx: AudioContext | null = null;
let isMuted = false;

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
        try {
            ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        } catch {
            return null;
        }
    }
    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }
    return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3, delay = 0) {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
}

function noise(duration: number, volume = 0.1, delay = 0) {
    const c = getCtx();
    if (!c) return;
    const bufSize = c.sampleRate * duration;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    src.connect(gain);
    gain.connect(c.destination);
    src.start(c.currentTime + delay);
}

const SOUNDS: Record<SoundEffect, () => void> = {
    'dice-roll': () => {
        // Gördülő kocka: gyors random zajok
        for (let i = 0; i < 6; i++) {
            noise(0.06, 0.12, i * 0.07);
            tone(200 + Math.random() * 300, 0.05, 'square', 0.08, i * 0.07);
        }
    },
    'money-gain': () => {
        // Felfelé menő arpeggio (pozitív)
        [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'sine', 0.25, i * 0.08));
    },
    'money-loss': () => {
        // Lefelé menő, tompított
        [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, 'triangle', 0.2, i * 0.09));
    },
    'buy-property': () => {
        // "Cha-ching" effekt
        tone(880, 0.08, 'square', 0.15);
        tone(1100, 0.12, 'sine', 0.2, 0.09);
        tone(1320, 0.2, 'sine', 0.25, 0.18);
    },
    'build-house': () => {
        // Két ütés, emelkedő
        tone(440, 0.1, 'square', 0.2);
        tone(660, 0.15, 'square', 0.25, 0.12);
    },
    'jail': () => {
        // Mély, rossz hang
        tone(130, 0.4, 'sawtooth', 0.3);
        tone(100, 0.5, 'square', 0.15, 0.1);
        noise(0.3, 0.05, 0.2);
    },
    'card-draw': () => {
        // Kártyalapozás: gyors zajsuhogás + magas ping
        noise(0.08, 0.15);
        tone(1760, 0.1, 'sine', 0.15, 0.05);
    },
    'bankruptcy': () => {
        // Tragikus leszálló
        [392, 349, 311, 262, 220, 175].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.2, i * 0.1));
    },
    'victory': () => {
        // Fanfár — dúr akkord arpeggio felfelé
        const fanfare = [523, 659, 784, 659, 784, 1047, 784, 1047, 1319];
        fanfare.forEach((f, i) => tone(f, 0.2, 'sine', 0.3, i * 0.1));
        // Harmónia alul
        [262, 330, 392].forEach((f, i) => tone(f, 0.8, 'triangle', 0.15, 0.6 + i * 0.05));
    },
    'turn-change': () => {
        // Rövid click-kattanás
        tone(660, 0.06, 'square', 0.12);
        tone(880, 0.08, 'sine', 0.1, 0.07);
    },
};

export function playSound(effect: SoundEffect): void {
    if (isMuted) return;
    try {
        SOUNDS[effect]?.();
    } catch {
        // Audio nem támogatott — néma hiba
    }
}

export function setMuted(muted: boolean): void {
    isMuted = muted;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('loricatus-muted', muted ? '1' : '0');
    }
}

export function getMuted(): boolean {
    return isMuted;
}

// LocalStorage-ból betöltés
if (typeof localStorage !== 'undefined') {
    isMuted = localStorage.getItem('loricatus-muted') === '1';
}

// React hook
export function useSound() {
    const [muted, setMutedState] = useState(isMuted);

    useEffect(() => {
        setMutedState(isMuted);
    }, []);

    const play = useCallback((effect: SoundEffect) => {
        playSound(effect);
    }, []);

    const toggleMute = useCallback(() => {
        const next = !isMuted;
        setMuted(next);
        setMutedState(next);
    }, []);

    return { play, muted, toggleMute };
}
