// ============================================================
// TRADE MODAL — Player-to-player trading UI (#51-57)
// ============================================================
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS } from '../data/board';
import type { ColorGroup, TradeOffer } from '../types';

export function TradeModal({ disabled }: { disabled?: boolean }) {
    const { state, dispatch } = useGame();
    const currentPlayer = state.players[state.currentPlayerIndex];

    const [selectedTarget, setSelectedTarget] = useState<string>('');
    const [offeredProps, setOfferedProps] = useState<number[]>([]);
    const [requestedProps, setRequestedProps] = useState<number[]>([]);
    const [offeredMoney, setOfferedMoney] = useState(0);
    const [requestedMoney, setRequestedMoney] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const tradablePlayers = state.players.filter(p => !p.isBankrupt && p.id !== currentPlayer.id);
    const targetPlayer = tradablePlayers.find(p => p.id === selectedTarget);

    const myTradableProps = useMemo(() =>
        currentPlayer.properties.filter(sid => {
            const space = BOARD_SPACES[sid];
            if (!space.property) return true; // Railroads/Utilities always tradable

            // #Audit fix: Official rule - cannot trade IF any property in the color group HAS buildings
            const colorGroup = space.property.colorGroup;
            const groupSpaces = Object.values(BOARD_SPACES).filter(s => s.type === 'property' && s.property?.colorGroup === colorGroup);
            const hasAnyBuildings = groupSpaces.some(s => {
                const o = state.ownedProperties[s.id];
                return o && (o.houses > 0 || o.hasHotel);
            });
            return !hasAnyBuildings;
        }), [currentPlayer.properties, state.ownedProperties]);

    const targetTradableProps = useMemo(() => {
        if (!targetPlayer) return [];
        return targetPlayer.properties.filter(sid => {
            const space = BOARD_SPACES[sid];
            if (!space.property) return true;

            const colorGroup = space.property.colorGroup;
            const groupSpaces = Object.values(BOARD_SPACES).filter(s => s.type === 'property' && s.property?.colorGroup === colorGroup);
            const hasAnyBuildings = groupSpaces.some(s => {
                const o = state.ownedProperties[s.id];
                return o && (o.houses > 0 || o.hasHotel);
            });
            return !hasAnyBuildings;
        });
    }, [targetPlayer, state.ownedProperties]);

    const toggleOffered = (sid: number) => {
        setOfferedProps(prev => prev.includes(sid) ? prev.filter(s => s !== sid) : [...prev, sid]);
    };

    const toggleRequested = (sid: number) => {
        setRequestedProps(prev => prev.includes(sid) ? prev.filter(s => s !== sid) : [...prev, sid]);
    };

    const handlePropose = () => {
        if (!selectedTarget) return;
        if (offeredProps.length === 0 && requestedProps.length === 0 && offeredMoney === 0 && requestedMoney === 0) return;

        const offer: TradeOffer = {
            fromPlayerId: currentPlayer.id,
            toPlayerId: selectedTarget,
            offeredProperties: offeredProps,
            requestedProperties: requestedProps,
            offeredMoney,
            requestedMoney,
        };
        dispatch({ type: 'PROPOSE_TRADE', offer });
        setIsOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setOfferedProps([]);
        setRequestedProps([]);
        setOfferedMoney(0);
        setRequestedMoney(0);
        setSelectedTarget('');
    };

    // Only show in turn-end phase
    if (state.phase !== 'turn-end') return null;

    return (
        <>
            <button
                className="btn-secondary"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
                style={{ fontSize: '0.8rem' }}
                title={disabled ? "Lejárt az időd!" : ""}
            >
                {disabled ? '⌛ Idő lejárt' : '🤝 Kereskedés'}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 150,
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-board)',
                                border: '1px solid var(--border-active)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                maxWidth: '460px',
                                width: '95%',
                                maxHeight: '85vh',
                                overflow: 'auto',
                            }}
                        >
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                color: 'var(--gold-light)',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                marginBottom: '1rem',
                            }}>
                                🤝 Kereskedés
                            </h3>

                            {/* Target selection */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                                    Kivel kereskedsz?
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {tradablePlayers.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedTarget(p.id)}
                                            style={{
                                                background: selectedTarget === p.id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                                                border: selectedTarget === p.id ? '2px solid var(--gold)' : '1px solid var(--border)',
                                                borderRadius: '8px',
                                                padding: '0.4rem 0.6rem',
                                                color: p.color,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {p.token} {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedTarget && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {/* My offers */}
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '0.3rem' }}>
                                            🎁 Adod ({currentPlayer.name})
                                        </h4>
                                        <PropList
                                            spaceIds={myTradableProps}
                                            selected={offeredProps}
                                            onToggle={toggleOffered}
                                            ownedProperties={state.ownedProperties}
                                        />
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>💰 Pénz felajánlása:</label>
                                            <input
                                                type="number"
                                                value={offeredMoney === 0 ? '' : offeredMoney}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                    setOfferedMoney(Math.max(0, Math.min(currentPlayer.money, isNaN(val) ? 0 : val)));
                                                }}
                                                placeholder="0"
                                                style={inputStyle}
                                                min={0}
                                                max={currentPlayer.money}
                                            />
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                                Max: {currentPlayer.money}k
                                            </div>
                                        </div>
                                    </div>

                                    {/* Target's offers */}
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', color: targetPlayer?.color || '#888', marginBottom: '0.3rem' }}>
                                            🎯 Kéred ({targetPlayer?.name})
                                        </h4>
                                        <PropList
                                            spaceIds={targetTradableProps}
                                            selected={requestedProps}
                                            onToggle={toggleRequested}
                                            ownedProperties={state.ownedProperties}
                                        />
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>💰 Pénz kérése:</label>
                                            <input
                                                type="number"
                                                value={requestedMoney === 0 ? '' : requestedMoney}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                    setRequestedMoney(Math.max(0, Math.min(targetPlayer?.money || 0, isNaN(val) ? 0 : val)));
                                                }}
                                                placeholder="0"
                                                style={inputStyle}
                                                min={0}
                                                max={targetPlayer?.money || 0}
                                            />
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                                Max: {targetPlayer?.money || 0}k
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                                <button className="btn-primary" onClick={handlePropose} disabled={!selectedTarget}>
                                    📨 Ajánlat küldése
                                </button>
                                <button className="btn-secondary" onClick={() => { setIsOpen(false); resetForm(); }}>
                                    Mégse
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/** Trade response modal — shown to recipient of trade offer */
export function TradeResponseModal() {
    const { state, dispatch } = useGame();
    const offer = state.tradeOffer;

    if (state.phase !== 'trading' || !offer) return null;

    const from = state.players.find(p => p.id === offer.fromPlayerId);
    const to = state.players.find(p => p.id === offer.toPlayerId);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 150,
                backdropFilter: 'blur(4px)',
            }}
        >
            <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                style={{
                    background: 'var(--bg-board)',
                    border: '2px solid var(--gold)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    maxWidth: '420px',
                    width: '90%',
                    textAlign: 'center',
                }}
            >
                <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    color: 'var(--gold-light)',
                    fontSize: '1.1rem',
                    marginBottom: '0.75rem',
                }}>
                    🤝 Kereskedési ajánlat
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <strong style={{ color: from?.color }}>{from?.name}</strong> → <strong style={{ color: to?.color }}>{to?.name}</strong>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>🎁 Kap:</div>
                        {offer.offeredProperties.map(sid => (
                            <div key={sid} style={{ fontSize: '0.75rem', padding: '0.15rem 0' }}>
                                <PropDot spaceId={sid} /> {BOARD_SPACES[sid]?.name}
                            </div>
                        ))}
                        {offer.offeredMoney > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>+ {offer.offeredMoney}k</div>
                        )}
                        {offer.offeredProperties.length === 0 && offer.offeredMoney === 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Semmi</div>
                        )}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: '#f87171', marginBottom: '0.25rem' }}>💸 Ad:</div>
                        {offer.requestedProperties.map(sid => (
                            <div key={sid} style={{ fontSize: '0.75rem', padding: '0.15rem 0' }}>
                                <PropDot spaceId={sid} /> {BOARD_SPACES[sid]?.name}
                            </div>
                        ))}
                        {offer.requestedMoney > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>+ {offer.requestedMoney}k</div>
                        )}
                        {offer.requestedProperties.length === 0 && offer.requestedMoney === 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Semmi</div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={() => dispatch({ type: 'ACCEPT_TRADE' })}>
                        ✅ Elfogadja
                    </button>
                    <button className="btn-danger" onClick={() => dispatch({ type: 'REJECT_TRADE' })}>
                        ❌ Elutasítja
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Helpers
function PropDot({ spaceId }: { spaceId: number }) {
    const space = BOARD_SPACES[spaceId];
    const color = space?.property?.colorGroup
        ? COLOR_GROUP_COLORS[space.property.colorGroup as ColorGroup]
        : '#888';
    return <span style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        background: color,
        marginRight: '0.25rem',
        verticalAlign: 'middle',
    }} />;
}

function PropList({
    spaceIds,
    selected,
    onToggle,
    ownedProperties,
}: {
    spaceIds: number[];
    selected: number[];
    onToggle: (sid: number) => void;
    ownedProperties: Record<number, { isMortgaged: boolean }>;
}) {
    if (spaceIds.length === 0) {
        return <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nincs eladható ingatlan</div>;
    }
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            maxHeight: '160px',
            overflow: 'auto',
            padding: '2px'
        }}>
            {spaceIds.map(sid => {
                const space = BOARD_SPACES[sid];
                const isSelected = selected.includes(sid);
                const isMortgaged = ownedProperties[sid]?.isMortgaged;
                const price = space.property?.price || space.railroad?.price || space.utility?.price || 0;

                return (
                    <button
                        key={sid}
                        onClick={() => onToggle(sid)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: isSelected ? 'rgba(201,168,76,0.15)' : 'var(--bg-surface)',
                            border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            color: isMortgaged ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textAlign: 'left',
                            transition: 'all 0.1s',
                        }}
                    >
                        <PropDot spaceId={sid} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{space?.name}</span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>
                                Érték: {price}k {isMortgaged && '(Jelzáloggal terhelt)'}
                            </span>
                        </div>
                        {isSelected && <span style={{ color: 'var(--gold)', fontWeight: 900 }}>✓</span>}
                    </button>
                );
            })}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '0.3rem 0.4rem',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
};
