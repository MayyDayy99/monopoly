// ============================================================
// TOKEN LAYER — Az overlay réteg a bábuk renderelésére
// A tábla felett lebeg, és CSS transform: translate() segítségével
// hardveresen gyorsított mozgást biztosít minden token számára.
// ============================================================
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../../engine/GameHooks';
import { getTokenByEmoji } from './TokenRegistry';
import { recalculateAllPositions, type TokenPosition } from './tokenPositioning';

/**
 * Az overlay réteg komponens.
 * A `.board-grid` felett lebeg, és minden aktív játékos tokenjét rendereli
 * abszolút pozícióban, CSS transform: translate(x, y) segítségével.
 */
export function TokenLayer() {
    const { state } = useGame();
    const layerRef = useRef<HTMLDivElement>(null);
    const [positions, setPositions] = useState<Map<string, TokenPosition>>(new Map());

    // Pozíciók újraszámolása
    const updatePositions = useCallback(() => {
        if (!layerRef.current) return;
        const newPositions = recalculateAllPositions(state.players, layerRef.current);
        setPositions(newPositions);
    }, [state.players]);

    // Pozíciók frissítése ha változik a játékosok pozíciója
    useEffect(() => {
        // Kis késleltetés, hogy a DOM renderelés garantáltan megtörténjen
        const timeout = setTimeout(updatePositions, 50);
        return () => clearTimeout(timeout);
    }, [updatePositions]);

    // ResizeObserver: ablak átméretezésekor automatikus újraszámolás
    useEffect(() => {
        const boardGrid = document.querySelector('.board-grid');
        if (!boardGrid) return;

        const observer = new ResizeObserver(() => {
            updatePositions();
        });
        observer.observe(boardGrid);

        return () => observer.disconnect();
    }, [updatePositions]);

    // Aktív (nem csődölt) játékosok
    const activePlayers = state.players.filter(p => !p.isBankrupt);

    return (
        <div
            id="tokens-layer"
            ref={layerRef}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                pointerEvents: 'none', // Kattintások átmennek a tábla celláira
            }}
        >
            {activePlayers.map(player => {
                const pos = positions.get(player.id);
                const tokenDef = getTokenByEmoji(player.token);
                const TokenComponent = tokenDef.component;
                const isCurrentPlayer = state.players[state.currentPlayerIndex]?.id === player.id;

                return (
                    <div
                        key={player.id}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            // Hardveresen gyorsított mozgás — TILOS top/left animálás!
                            transform: pos
                                ? `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
                                : 'translate(-9999px, -9999px)',
                            transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            pointerEvents: 'auto',
                            zIndex: isCurrentPlayer ? 25 : 21,
                        }}
                        title={player.name}
                    >
                        <TokenComponent
                            size={20}
                            color={player.color}
                            isAnimating={isCurrentPlayer}
                            label={player.name}
                        />
                    </div>
                );
            })}
        </div>
    );
}
