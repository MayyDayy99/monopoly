import { useGame } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS } from '../data/board';
import { AnimatedMoney } from './AnimatedMoney';

export function PlayerStats() {
    const { state } = useGame();

    return (
        <div className="sidebar-card">
            <h3>👥 Játékosok</h3>
            {state.players.map((player, index) => {
                const isActive = index === state.currentPlayerIndex;

                return (
                    <div
                        key={player.id}
                        className={`player-stat-row ${isActive ? 'active' : ''} ${player.isBankrupt ? 'bankrupt' : ''}`}
                    >
                        <span style={{ fontSize: '1.3rem' }}>{player.token}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span style={{
                                    fontWeight: 700,
                                    color: player.color,
                                    fontSize: '0.85rem',
                                }}>
                                    {player.name}
                                </span>
                                {player.isBankrupt
                                    ? <span className="player-money">CSŐD</span>
                                    : <AnimatedMoney
                                        value={player.money}
                                        className="player-money"
                                    />
                                }
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '0.3rem',
                                marginTop: '0.25rem',
                                flexWrap: 'wrap',
                            }}>
                                {player.properties.map(sid => {
                                    const space = BOARD_SPACES[sid];
                                    const color = space?.property?.colorGroup
                                        ? COLOR_GROUP_COLORS[space.property.colorGroup]
                                        : space?.type === 'railroad' ? '#888' : '#4499bb';
                                    const owned = state.ownedProperties[sid];
                                    return (
                                        <div
                                            key={sid}
                                            title={`${space?.name}${owned?.isMortgaged ? ' (JLZ)' : ''}`}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '2px',
                                                background: owned?.isMortgaged ? '#555' : color,
                                                opacity: owned?.isMortgaged ? 0.5 : 1,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            {player.inJail && (
                                <span style={{ fontSize: '0.65rem', color: '#f87171' }}>🔒 Börtönben</span>
                            )}
                            {player.hasGetOutOfJailCard > 0 && (
                                <span style={{ fontSize: '0.65rem', color: '#a78bfa' }}> 🃏×{player.hasGetOutOfJailCard}</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
