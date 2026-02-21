import { useState } from 'react';
import { useGame, useAsyncMovement } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS, COLOR_GROUP_MONOGRAMS } from '../data/board';
import type { BoardSpace as BoardSpaceType } from '../types';
import { SpaceDetail } from './SpaceDetail';
import { ControlPanel } from './ControlPanel';
import { TokenLayer } from './tokens/TokenLayer';
import logoKicsi from '../assets/logo_kicsi.png';

// Map space index → grid position (row, col) for 11x11 grid
function getGridPosition(index: number): { row: number; col: number; edge: string } {
    if (index <= 10) return { row: 11, col: 11 - index, edge: 'bottom' };
    if (index <= 19) return { row: 10 - (index - 11), col: 1, edge: 'left' };
    if (index <= 30) return { row: 1, col: index - 19, edge: 'top' };
    return { row: index - 29, col: 11, edge: 'right' };
}

function getSpaceIcon(space: BoardSpaceType): string {
    switch (space.type) {
        case 'go': return '➡️';
        case 'jail': return '🚫';
        case 'free-parking': return '🅿️';
        case 'go-to-jail': return '🚁';
        case 'chance': return '❓';
        case 'community': return '🏛️';
        case 'railroad': return '📡';
        case 'utility': return space.name.includes('Műhold') ? '🛰️' : '🖥️';
        case 'tax': return '💳';
        default: return '';
    }
}

export function Board() {
    const { state } = useGame();
    useAsyncMovement(); // AAA Sequential Movement
    const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

    const isCorner = (id: number) => [0, 10, 20, 30].includes(id);

    return (
        <div className="relative">
            <div className="board-grid">
                {BOARD_SPACES.map((space) => {
                    const { row, col, edge } = getGridPosition(space.id);
                    const corner = isCorner(space.id);
                    const colorGroup = space.property?.colorGroup;
                    const colorHex = colorGroup ? COLOR_GROUP_COLORS[colorGroup] : undefined;
                    const monogram = colorGroup ? COLOR_GROUP_MONOGRAMS[colorGroup] : undefined;
                    const owned = state.ownedProperties[space.id];
                    const ownerPlayer = owned ? state.players.find(p => p.id === owned.ownerId) : null;
                    const price = space.property?.price || space.railroad?.price || space.utility?.price;
                    const icon = getSpaceIcon(space);

                    return (
                        <div
                            key={space.id}
                            data-space-id={space.id}
                            className={`board-space ${corner ? 'corner' : ''} edge-${edge}`}
                            style={{ gridRow: row, gridColumn: col }}
                            onClick={() => setSelectedSpace(space.id)}
                            role="button"
                            tabIndex={0}
                        >
                            {colorHex && (
                                <div className="color-bar" style={{ background: colorHex }}>
                                    {state.houseRules?.colorblindMode && monogram}
                                </div>
                            )}
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
                            {owned?.isMortgaged && <div className="mortgage-overlay">JLZ</div>}
                            {icon && !colorHex && <span style={{ fontSize: corner ? '1.2rem' : '0.8rem', zIndex: 1 }}>{icon}</span>}
                            <span className="space-name">{space.name}</span>
                            {price && !owned && <span className="space-price">{price}k</span>}
                            {ownerPlayer && !owned?.isMortgaged && (
                                <div className="owner-ring" style={{ borderColor: ownerPlayer.color }} />
                            )}
                        </div>
                    );
                })}

                <div className="board-center">
                    <div className="radar-hud">
                        <div className="radar-circle radar-circle-1" />
                        <div className="radar-circle radar-circle-2" />
                        <div className="radar-circle radar-circle-3" />
                        <div className="radar-crosshair" />
                        <div className="radar-crosshair radar-crosshair-v" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '1.5rem 0' }}>
                        <div style={{ textAlign: 'center', width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                            <img src={logoKicsi} alt="Loricatus Logo" style={{ width: '60px', height: 'auto', filter: 'drop-shadow(0 0 15px var(--neon-glow))' }} />
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: 'var(--neon)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Monopoly by Loricatus
                            </div>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <ControlPanel />
                        </div>
                    </div>
                </div>
            </div>

            <TokenLayer />

            {selectedSpace !== null && (
                <SpaceDetail spaceId={selectedSpace} onClose={() => setSelectedSpace(null)} />
            )}
        </div>
    );
}
