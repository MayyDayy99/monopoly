// ============================================================
// LOCAL STORAGE — Save/Load game state (#10)
// ============================================================
import type { GameState } from '../types';

const SAVE_KEY = 'monopoly_save';

export function saveGame(state: GameState): void {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(SAVE_KEY, serialized);
    } catch (e) {
        console.error('[Monopoly] Failed to save game:', e);
    }
}

export function loadGame(): GameState | null {
    try {
        const serialized = localStorage.getItem(SAVE_KEY);
        if (!serialized) return null;
        const state = JSON.parse(serialized) as GameState;
        // Basic validation
        if (!state.players || !state.phase || !Array.isArray(state.players)) {
            return null;
        }
        return state;
    } catch (e) {
        console.error('[Monopoly] Failed to load game:', e);
        return null;
    }
}

export function clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
}

export function hasSavedGame(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
}
