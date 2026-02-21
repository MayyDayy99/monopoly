// ============================================================
// USE BOT PLAYER — React hook for automatic bot play (#73)
// ============================================================
import { useEffect, useRef } from 'react';
import { useGame } from './GameHooks';
import { getBotAction, BOT_DELAY } from './botEngine';

/**
 * Hook that automatically executes bot actions when it's a bot's turn.
 * Should be called once at the app level.
 */
export function useBotPlayer() {
    const { state, dispatch } = useGame();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Clean up any pending timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Only act if game is in progress
        if (state.phase === 'setup' || state.phase === 'game-over') return;

        // Find who is supposed to act now
        let actingId: string | null = null;
        if (state.phase === 'auction' && state.auction) {
            actingId = state.auction.activeBidders[state.auction.currentBidderIndex];
        } else if (state.phase === 'trading' && state.tradeOffer) {
            actingId = state.tradeOffer.toPlayerId;
        } else {
            actingId = state.players[state.currentPlayerIndex]?.id;
        }

        const actingPlayer = state.players.find(p => p.id === actingId);
        if (!actingPlayer?.isBot || actingPlayer.isBankrupt) return;

        const action = getBotAction(state);
        if (!action) return;

        // Delay to make it feel natural
        timerRef.current = setTimeout(() => {
            dispatch(action);
        }, BOT_DELAY);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [state, dispatch]);
}
