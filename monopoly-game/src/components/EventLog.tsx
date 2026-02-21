import { useEffect, useRef } from 'react';
import { useGame } from '../engine/GameHooks';

export function EventLog() {
    const { state } = useGame();
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.logs.length]);

    const recentLogs = state.logs.slice(-50);

    return (
        <div className="event-log">
            {recentLogs.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Még nem történt semmi...
                </div>
            )}
            {recentLogs.map(entry => {
                const player = state.players.find(p => p.id === entry.playerId);
                return (
                    <div key={entry.id} className={`log-entry ${entry.type} animate-slide-up`}>
                        {player && (
                            <span style={{ color: player.color, fontWeight: 600 }}>{player.token} </span>
                        )}
                        {entry.message}
                    </div>
                );
            })}
            <div ref={logEndRef} />
        </div>
    );
}
