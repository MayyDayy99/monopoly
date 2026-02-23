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
        if (saved && saved.phase !== 'setup' && !saved.roomId) { // Csak akkor töltsük be a mentést, ha nem multiplayer
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

    // Firestore Replay — Iratkozás a szoba változásaira
    useEffect(() => {
        if (state.roomId) {
            console.log(`📡 Kapcsolódás a szobához: ${state.roomId}`);
            const unsubscribe = onSnapshot(doc(db, 'games', state.roomId), (snapshot) => {
                if (snapshot.exists()) {
                    const cloudState = snapshot.data() as GameState;
                    // Csak akkor szinkronizálunk, ha a fázis vagy a köridő eltér (vagy bármi más kritikus)
                    rawDispatch({ type: 'SYNC_STATE', state: cloudState });
                }
            });
            return unsubscribe;
        }
    }, [state.roomId]);

    // Kedvezményes dispatch: Ha MP, akkor Firestore-ba írunk, ha nem, akkor lokálisan
    const dispatch = useCallback<React.Dispatch<GameAction>>((action) => {
        if (state.roomId) {
            // Szigorú körvédelem: Csak az aktuális játékos hajthat végre akciókat a Firestore-ban
            // Kivétel: START_GAME és SYNC_STATE (vagy rendszerlogok)
            // De az egyszerűség kedvéért a UI-ban tiltjuk le a gombokat.

            const nextState = gameReducer(state, action);
            // Ha ez egy MP szoba, akkor minden akciót a felhőbe küldünk
            setDoc(doc(db, 'games', state.roomId), nextState).catch(e => {
                console.error("Firestore update hiba:", e);
            });
        } else {
            rawDispatch(action);
        }
    }, [state]);

    // Auto-save state to LocalStorage (csak single player esetén)
    useEffect(() => {
        if (state.phase !== 'setup' && !state.roomId) {
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
