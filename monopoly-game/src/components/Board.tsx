import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS, COLOR_GROUP_MONOGRAMS } from '../data/board';
import type { BoardSpace as BoardSpaceType } from '../types';
import { SpaceDetail } from './SpaceDetail';
import { ControlPanel } from './ControlPanel';

// Map space index → grid position (row, col) for 11x11 grid
function getGridPosition(index: number): { row: number; col: number; edge: string } {
    // Bottom row: 0-10 (row 11, col 11 down to 1)
    if (index <= 10) {
        return { row: 11, col: 11 - index, edge: 'bottom' };
    }
    // Left column: 11-19 (col 1, row 10 down to 2)
    if (index <= 19) {
        return { row: 10 - (index - 11), col: 1, edge: 'left' };
    }
    // Top row: 20-30 (row 1, col 1 to 11)
    if (index <= 30) {
        return { row: 1, col: index - 19, edge: 'top' };
    }
    // Right column: 31-39 (col 11, row 2 to 10)
    return { row: index - 29, col: 11, edge: 'right' };
}

function getSpaceIcon(space: BoardSpaceType): string {
    switch (space.type) {
        case 'go': return '➡️';
        case 'jail': return '🔒';
        case 'free-parking': return '🅿️';
        case 'go-to-jail': return '🚔';
        case 'chance': return '❓';
        case 'community': return '🏛️';
        case 'railroad': return '🚂';
        case 'utility': return space.name.includes('Elektromos') ? '⚡' : '💧';
        case 'tax': return '💰';
        default: return '';
    }
}

export function Board() {
    const { state } = useGame();
    const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

    const isCorner = (id: number) => [0, 10, 20, 30].includes(id);

    return (
        <div className="relative">
            <div className="board-grid">
                {/* Render 40 board spaces */}
                {BOARD_SPACES.map((space) => {
                    const { row, col, edge } = getGridPosition(space.id);
                    const corner = isCorner(space.id);
                    const colorGroup = space.property?.colorGroup;
                    const colorHex = colorGroup ? COLOR_GROUP_COLORS[colorGroup] : undefined;
                    const monogram = colorGroup ? COLOR_GROUP_MONOGRAMS[colorGroup] : undefined;
                    const owned = state.ownedProperties[space.id];
                    const ownerPlayer = owned ? state.players.find(p => p.id === owned.ownerId) : null;
                    const playersHere = state.players.filter(p => p.position === space.id && !p.isBankrupt);
                    const price = space.property?.price || space.railroad?.price || space.utility?.price;
                    const icon = getSpaceIcon(space);

                    return (
                        <div
                            key={space.id}
                            className={`board-space ${corner ? 'corner' : ''} edge-${edge}`}
                            style={{ gridRow: row, gridColumn: col }}
                            onClick={() => setSelectedSpace(space.id)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${space.name}${price ? `, ára ${price}k` : ''}${ownerPlayer ? `, tulajdonosa ${ownerPlayer.name}` : ''}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setSelectedSpace(space.id);
                                }
                            }}
                        >
                            {/* Color bar for properties */}
                            {colorHex && (
                                <div className="color-bar" style={{
                                    background: colorHex,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.55rem',
                                    fontWeight: 900,
                                    color: 'rgba(255,255,255,0.8)',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                }}>
                                    {state.houseRules?.colorblindMode && monogram}
                                </div>
                            )}

                            {/* Houses/Hotel indicator */}
                            {owned && (owned.houses > 0 || owned.hasHotel) && (
                                <div className="houses-indicator">
                                    {owned.hasHotel ? (
                                        <div className="hotel-dot" />
                                    ) : (
                                        Array.from({ length: owned.houses }).map((_, i) => (
                                            <div key={i} className="house-dot" />
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Mortgage overlay */}
                            {owned?.isMortgaged && (
                                <div className="mortgage-overlay">JLZ</div>
                            )}

                            {/* Space content */}
                            {icon && !colorHex && (
                                <span style={{ fontSize: corner ? '1.2rem' : '0.8rem', zIndex: 1 }}>{icon}</span>
                            )}
                            <span className="space-name">{space.name}</span>
                            {price && !owned && (
                                <span className="space-price">{price}k</span>
                            )}

                            {/* Owner indicator */}
                            {ownerPlayer && !owned?.isMortgaged && (
                                <div className="owner-ring" style={{ borderColor: ownerPlayer.color }} />
                            )}

                            {/* Player tokens — #42: Smooth movement with layout prop */}
                            {playersHere.length > 0 && (
                                <div
                                    className="player-tokens"
                                    style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}
                                >
                                    {playersHere.map(p => (
                                        <motion.span
                                            key={p.id}
                                            layout
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="player-token"
                                            title={p.name}
                                            style={{ display: 'inline-block', zIndex: 10 }}
                                        >
                                            {p.token}
                                        </motion.span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Center area — Control Panel */}
                <div className="board-center">
                    <ControlPanel />
                </div>
            </div>

            {/* Space detail popup */}
            {selectedSpace !== null && (
                <SpaceDetail spaceId={selectedSpace} onClose={() => setSelectedSpace(null)} />
            )}
        </div>
    );
}
