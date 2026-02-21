// ============================================================
// SOUND MANAGER — Hook-based audio system (#45, #82)
// Ready for mp3 integration
// ============================================================

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

// Sound file registry — plug in real audio files here
const SOUND_FILES: Partial<Record<SoundEffect, string>> = {
    // Example:
    // 'dice-roll': '/sounds/dice.mp3',
    // 'money-gain': '/sounds/cashregister.mp3',
    // 'jail': '/sounds/jail-bars.mp3',
};

let isMuted = false;

export function playSound(effect: SoundEffect): void {
    if (isMuted) return;
    const src = SOUND_FILES[effect];
    if (!src) return; // No sound file mapped yet

    try {
        const audio = new Audio(src);
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Autoplay blocked — silent fail
        });
    } catch {
        // Audio not supported — silent fail
    }
}

export function setMuted(muted: boolean): void {
    isMuted = muted;
}

export function getMuted(): boolean {
    return isMuted;
}

// React hook for components
import { useCallback } from 'react';

export function useSound() {
    const play = useCallback((effect: SoundEffect) => {
        playSound(effect);
    }, []);

    return { play, setMuted, getMuted };
}
