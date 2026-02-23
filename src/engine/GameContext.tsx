import { useReducer, type ReactNode, useMemo, useEffect, useCallback, useState } from 'react';
import type { GameAction, GameState } from '../types';
import { gameReducer, createInitialState } from './gameReducer';
import { saveGame, loadGame } from './storage';
import { db, auth } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { GameContext } from './GameContextCore';

export function GameProvider({ children }: { children: ReactNode }) {
    const [localUid, setLocalUid] = useState<string | null>(null);

    const [state, rawDispatch] = useReducer(gameReducer, undefined, () => {
        const saved = loadGame();
        if (saved) {
            const initial = createInitialState();
            return {
                ...initial,
                ...saved,
                houseRules: {
                    ...initial.houseRules,
                    ...(saved.houseRules || {})
                },
            };
        }
        return createInitialState();
    });

    // Firebase Auth figyelő
    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setLocalUid(user?.uid || null);
        });
    }, []);

    // Firestore szinkronizáció
    useEffect(() => {
        if (state.roomId) {
            console.log(`📡 [Loricatus] Kapcsolódás a szobához: ${state.roomId}`);
            const unsubscribe = onSnapshot(doc(db, 'games', state.roomId), (snapshot) => {
                if (snapshot.exists()) {
                    const cloudState = snapshot.data() as GameState;
                    // Szinkronizáljuk a felhő állapotát a lokálissal
                    rawDispatch({ type: 'SYNC_STATE', state: cloudState });
                }
            }, (error) => {
                console.error("[Loricatus] Firestore hiba:", error);
            });
            return unsubscribe;
        }
    }, [state.roomId]);

    // Kedvezményes dispatch: Optimista frissítés + Firestore szinkron
    const dispatch = useCallback<React.Dispatch<GameAction>>((action) => {
        // 1. Lokális frissítés (Azonnali válasz)
        rawDispatch(action);

        // 2. Szinkronizálás a felhőbe, ha van aktív szoba
        if (state.roomId) {
            const nextState = gameReducer(state, action);
            setDoc(doc(db, 'games', state.roomId), nextState).catch(e => {
                console.error("[Loricatus] Felhő szinkronizációs hiba:", e);
            });
        }
    }, [state]);

    // Auto-save state to LocalStorage
    useEffect(() => {
        if (state.phase !== 'setup' || state.roomId) {
            saveGame(state);
        }
    }, [state]);

    const value = useMemo(() => ({ state, dispatch, localUid }), [state, dispatch, localUid]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}
