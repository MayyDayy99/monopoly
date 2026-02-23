import { useContext, useState, useEffect } from 'react';
import { GameContext, type GameContextType } from './GameContextCore';

export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

export function useCurrentPlayer() {
    const { state } = useGame();
    return state.players[state.currentPlayerIndex] || null;
}

export function usePlayerById(playerId: string) {
    const { state } = useGame();
    return state.players.find(p => p.id === playerId) || null;
}

export function useTurnTimerExpired() {
    const { state } = useGame();
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!state.turnTimer) {
            setIsExpired(false);
            return;
        }

        const checkValue = () => {
            const expired = Date.now() > state.turnTimer!;
            setIsExpired(expired);
        };

        checkValue();
        const interval = setInterval(checkValue, 1000);
        return () => clearInterval(interval);
    }, [state.turnTimer]);

    return isExpired;
}

/**
 * AAA Szekvenciális Mozgáskezelő (Async Routing)
 * Amikor a fázis 'moving'-ra vált, ez a hook lépésről lépésre
 * lépteti a bábut, amíg el nem fogy a pending Steps.
 */
export function useAsyncMovement() {
    const { state, dispatch, localUid } = useGame();
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        const cp = state.players[state.currentPlayerIndex];
        const isMyTurn = !state.roomId || (cp?.uid === localUid);

        // Multiplayer esetén csak az aktuális játékos indítja el a mozgási szekvenciát,
        // a többiek csak passzívan figyelik a Firestore-ból érkező állapoti változásokat.
        if (!isMyTurn) return;

        const hasPendingSteps = state.totalStepsPending > 0;
        const hasTargetPos = state.targetPosition !== null && state.targetPosition !== state.players[state.currentPlayerIndex]?.position;

        if (state.phase === 'moving' && (hasPendingSteps || hasTargetPos) && !isMoving) {
            const runMovement = async () => {
                setIsMoving(true);
                // AAA Super Snappy: minimális indulási késleltetés
                await new Promise(r => setTimeout(r, 100));

                if (hasPendingSteps) {
                    let steps = state.totalStepsPending;
                    while (steps > 0) {
                        dispatch({ type: 'MOVE_STEP' });
                        steps--;
                        // AAA Flow: 160ms ütemezés a 600ms-os tranzícióhoz tökéletes "csúszást" ad
                        await new Promise(r => setTimeout(r, 160));
                    }
                } else if (hasTargetPos) {
                    const cp = state.players[state.currentPlayerIndex];
                    let current = cp?.position || 0;
                    const target = state.targetPosition!;
                    while (current !== target) {
                        dispatch({ type: 'MOVE_STEP' });
                        current = (current + 1) % 40;
                        await new Promise(r => setTimeout(r, 160));
                    }
                }
                setIsMoving(false);
            };
            runMovement();
        }
    }, [state.phase, state.totalStepsPending, state.targetPosition, isMoving, dispatch, state.roomId, state.currentPlayerIndex, localUid]);
}

/**
 * Automatikus tokenAnimState visszaállítás.
 * MOVING → IDLE 0.5s után (a CSS transition ideje)
 * ACTION → IDLE 2s után (a szkenneranimáció ideje)
 */
export function useTokenAnimReset() {
    const { state, dispatch, localUid } = useGame();

    useEffect(() => {
        const cp = state.players[state.currentPlayerIndex];
        const isMyTurn = !state.roomId || (cp?.uid === localUid);
        if (!isMyTurn) return; // Csak az aktuális játékos resetelhet, hogy ne legyen loop

        if (state.tokenAnimState === 'MOVING') {
            const timeout = setTimeout(() => {
                dispatch({ type: 'SET_TOKEN_ANIM', animState: 'IDLE' });
            }, 600);
            return () => clearTimeout(timeout);
        }
        if (state.tokenAnimState === 'ACTION') {
            const timeout = setTimeout(() => {
                dispatch({ type: 'SET_TOKEN_ANIM', animState: 'IDLE' });
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [state.tokenAnimState, dispatch, state.roomId, localUid, state.currentPlayerIndex]);
}
