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
