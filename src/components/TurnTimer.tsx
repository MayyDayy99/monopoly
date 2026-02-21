// ============================================================
// TURN TIMER — Visual countdown for current turn (#67)
// ============================================================
import { useState, useEffect } from 'react';
import { useGame } from '../engine/GameHooks';

export function TurnTimer() {
    const { state } = useGame();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // #Audit fix: Avoid synchronous setState in effect
    const shouldReset = !state.turnTimer || state.phase === 'game-over' || state.phase === 'setup';
    if (shouldReset && timeLeft !== null) {
        setTimeLeft(null);
    }

    useEffect(() => {
        if (shouldReset) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((state.turnTimer! - now) / 1000));
            setTimeLeft(diff);

            if (diff <= 0) {
                // Time's up!
                // For now, we don't force end turn automatically for humans to avoid frustration,
                // but we could. For bots, they move faster anyway.
                // clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state.turnTimer, state.phase]);

    if (timeLeft === null) return null;

    const isLow = timeLeft !== null && timeLeft <= 10;
    const isExpired = timeLeft !== null && timeLeft <= 0;

    return (
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            color: isExpired ? '#fff' : (isLow ? '#f87171' : 'var(--text-secondary)'),
            background: isExpired ? '#dc2626' : 'var(--bg-surface)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: `1px solid ${isExpired ? '#dc2626' : (isLow ? '#f87171' : 'var(--border)')}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.3s',
            fontWeight: isExpired ? 700 : 400,
            boxShadow: isExpired ? '0 0 10px rgba(220, 38, 38, 0.5)' : 'none',
        }}>
            <span style={{ fontSize: '0.9rem' }}>{isExpired ? '🚫' : '⏳'}</span>
            <span>
                {isExpired ? 'LEJÁRT' : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </span>
        </div>
    );
}
