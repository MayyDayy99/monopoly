import { useGame, useTurnTimerExpired } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS } from '../data/board';
import { canBuildHouse, canBuildHotel, canSellHouse } from '../engine/gameLogic';

interface SpaceDetailProps {
    spaceId: number;
    onClose: () => void;
}

export function SpaceDetail({ spaceId, onClose }: SpaceDetailProps) {
    const { state, dispatch } = useGame();
    const isExpired = useTurnTimerExpired();
    const space = BOARD_SPACES[spaceId];
    const owned = state.ownedProperties[spaceId];
    const currentPlayer = state.players[state.currentPlayerIndex];
    const ownerPlayer = owned ? state.players.find(p => p.id === owned.ownerId) : null;

    if (!space) return null;

    const colorHex = space.property?.colorGroup ? COLOR_GROUP_COLORS[space.property.colorGroup] : '#555';
    const isProperty = space.type === 'property' || space.type === 'railroad' || space.type === 'utility';
    const isMine = owned?.ownerId === currentPlayer?.id;

    return (
        <div className="property-popup" onClick={onClose}>
            <div className="property-detail animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Color header */}
                {space.property && (
                    <div className="prop-color-header" style={{ background: colorHex }}>
                        <h3>{space.name}</h3>
                    </div>
                )}
                {!space.property && (
                    <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.1rem',
                        color: 'var(--gold-light)',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                    }}>
                        {space.name}
                    </h3>
                )}

                {/* Property details */}
                {space.property && (
                    <table className="rent-table">
                        <tbody>
                            <tr><td>Ár</td><td>{space.property.price}k</td></tr>
                            <tr><td>Alap szkennel díj</td><td>{space.property.rentBase}k</td></tr>
                            <tr><td>LOD 100</td><td>{space.property.rent1H}k</td></tr>
                            <tr><td>LOD 200</td><td>{space.property.rent2H}k</td></tr>
                            <tr><td>LOD 300</td><td>{space.property.rent3H}k</td></tr>
                            <tr><td>LOD 400</td><td>{space.property.rent4H}k</td></tr>
                            <tr><td>Digitális Iker</td><td>{space.property.rentHotel}k</td></tr>
                            <tr><td>LOD Szint ára</td><td>{space.property.houseCost}k</td></tr>
                            <tr><td>Jelzálog</td><td>{space.property.mortgageValue}k</td></tr>
                        </tbody>
                    </table>
                )}

                {space.railroad && (
                    <table className="rent-table">
                        <tbody>
                            <tr><td>Ár</td><td>{space.railroad.price}k</td></tr>
                            <tr><td>1 technológia</td><td>25k</td></tr>
                            <tr><td>2 technológia</td><td>50k</td></tr>
                            <tr><td>3 technológia</td><td>100k</td></tr>
                            <tr><td>4 technológia</td><td>200k</td></tr>
                            <tr><td>Jelzálog</td><td>{space.railroad.mortgageValue}k</td></tr>
                        </tbody>
                    </table>
                )}

                {space.utility && (
                    <table className="rent-table">
                        <tbody>
                            <tr><td>Ár</td><td>{space.utility.price}k</td></tr>
                            <tr><td>1 szerver</td><td>4× dobás</td></tr>
                            <tr><td>2 szerver</td><td>10× dobás</td></tr>
                            <tr><td>Jelzálog</td><td>{space.utility.mortgageValue}k</td></tr>
                        </tbody>
                    </table>
                )}

                {/* Owner info */}
                {ownerPlayer && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            Tulajdonos: <span style={{ color: ownerPlayer.color, fontWeight: 700 }}>{ownerPlayer.token} {ownerPlayer.name}</span>
                        </span>
                        {owned && (
                            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {owned.hasHotel ? '🌐 Digitális Iker' : owned.houses > 0 ? `📊 LOD ${owned.houses * 100}` : 'Nyers felmérés'}
                                {owned.isMortgaged && ' • 🏦 Jelzálogban'}
                            </div>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                {isMine && isProperty && state.phase === 'turn-end' && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {canBuildHouse(state, currentPlayer.id, spaceId) && (
                            <button
                                className="btn-primary"
                                onClick={() => dispatch({ type: 'BUILD_HOUSE', spaceId })}
                                disabled={isExpired}
                                title={isExpired ? "Lejárt az időd!" : ""}
                            >
                                📊 {isExpired ? '⌛ Idő lejárt' : `LOD Szint telepítése (${space.property?.houseCost}k)`}
                            </button>
                        )}
                        {canBuildHotel(state, currentPlayer.id, spaceId) && (
                            <button
                                className="btn-primary"
                                onClick={() => dispatch({ type: 'BUILD_HOTEL', spaceId })}
                                disabled={isExpired}
                                title={isExpired ? "Lejárt az időd!" : ""}
                            >
                                🌐 {isExpired ? '⌛ Idő lejárt' : `Digitális Iker létrehozása (${space.property?.houseCost}k)`}
                            </button>
                        )}
                        {canSellHouse(state, currentPlayer.id, spaceId) && (
                            <button
                                className="btn-secondary"
                                onClick={() => dispatch({ type: 'SELL_HOUSE', spaceId })}
                                style={{ borderColor: '#f87171' }}
                            >
                                🏚️ LOD Szint eltávolítása (+{Math.floor((space.property?.houseCost || 0) / 2)}k)
                            </button>
                        )}
                        {!owned?.isMortgaged && owned?.houses === 0 && !owned?.hasHotel && (
                            <button
                                className="btn-secondary"
                                onClick={() => dispatch({ type: 'MORTGAGE_PROPERTY', spaceId })}
                                disabled={isExpired}
                                title={isExpired ? "Lejárt az időd!" : ""}
                            >
                                🏦 Jelzálogba adás
                            </button>
                        )}
                        {owned?.isMortgaged && (
                            <button
                                className="btn-secondary"
                                onClick={() => dispatch({ type: 'UNMORTGAGE_PROPERTY', spaceId })}
                            >
                                ✅ Jelzálog kiváltása
                            </button>
                        )}
                    </div>
                )}

                <button
                    className="btn-secondary"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={onClose}
                >
                    Bezárás
                </button>
            </div>
        </div>
    );
}
