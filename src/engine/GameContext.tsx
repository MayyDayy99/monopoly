// ============================================================
// GAME CONTEXT — React Context + useReducer
// Ready for future Socket.io integration
// With LocalStorage auto-save (#10)
// ============================================================
import { useReducer, type ReactNode, useMemo, useEffect, useCallback } from 'react';
import type { GameAction } from '../types';
import { gameReducer, createInitialState } from './gameReducer';
import { saveGame, loadGame } from './storage';

import { GameContext } from './GameContextCore';

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, rawDispatch] = useReducer(gameReducer, undefined, () => {
        const saved = loadGame();
        if (saved && saved.phase !== 'setup') {
            // #Audit fix: Ensure new properties like houseRules exist in the loaded state
            const initial = createInitialState();
            return {
                ...initial, // Default properties
                ...saved,   // Overwrite with saved
                houseRules: {
                    ...initial.houseRules,
                    ...(saved.houseRules || {})
                },
                // Reset decks to avoid serializing them if they were broken, 
                // but let's trust the load for now unless it causes loops
            };
        }
        return createInitialState();
    });

    // Wrap dispatch to auto-save after every action
    const dispatch = useCallback<React.Dispatch<GameAction>>((action) => {
        rawDispatch(action);
    }, []);

    // Auto-save state to LocalStorage on every change (#10)
    useEffect(() => {
        if (state.phase !== 'setup') {
            saveGame(state);
        }
    }, [state]);

    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}
