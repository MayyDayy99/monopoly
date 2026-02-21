// ============================================================
// AUCTION PANEL — Dynamic bidding UI (#58-62)
// ============================================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../engine/GameHooks';
import { BOARD_SPACES, COLOR_GROUP_COLORS } from '../data/board';
import type { ColorGroup } from '../types';

export function AuctionPanel() {
    const { state, dispatch } = useGame();
    const auction = state.auction;
    const [bidAmount, setBidAmount] = useState(10);

    // #Audit fix: Update bid amount automatically when current bid changes
    useEffect(() => {
        if (auction) {
            setBidAmount(auction.currentBid + 10);
        }
    }, [auction?.currentBid]);

    if (state.phase !== 'auction' || !auction) return null;

    const space = BOARD_SPACES[auction.spaceId];
    const currentBidderId = auction.activeBidders[auction.currentBidderIndex];
    const currentBidder = state.players.find(p => p.id === currentBidderId);
    const highestBidder = auction.currentBidderId
        ? state.players.find(p => p.id === auction.currentBidderId)
        : null;
    const isHumanTurn = currentBidder && !currentBidder.isBot;

    const colorHex = space?.property?.colorGroup
        ? COLOR_GROUP_COLORS[space.property.colorGroup as ColorGroup]
        : '#888';

    const minBid = auction.currentBid + 1;
    const maxBid = currentBidder?.money || 0;

    const presetBids = [
        minBid,
        Math.ceil(minBid * 1.5),
        minBid + 50,
        minBid + 100,
    ].filter(b => b <= maxBid);

    const handleBid = () => {
        if (bidAmount > auction.currentBid && bidAmount <= maxBid) {
            dispatch({ type: 'AUCTION_BID', amount: bidAmount });
            setBidAmount(prev => Math.max(prev, auction.currentBid + 11));
        }
    };

    const handlePass = () => {
        dispatch({ type: 'AUCTION_PASS' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 150,
                backdropFilter: 'blur(6px)',
            }}
        >
            <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                    background: 'var(--bg-board)',
                    border: '2px solid var(--gold)',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* Property header */}
                <div style={{
                    background: colorHex,
                    borderRadius: '8px',
                    padding: '0.5rem',
                    margin: '-1.75rem -1.75rem 1rem -1.75rem',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                }}>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                        ÁRVERÉS
                    </span>
                    <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'white',
                        fontSize: '1.15rem',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}>
                        {space?.name}
                    </h3>
                </div>

                {/* Current bid info */}
                <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Aktuális licit
                    </div>
                    <motion.div
                        key={auction.currentBid}
                        initial={{ scale: 1.3, color: '#f5cc00' }}
                        animate={{ scale: 1, color: '#e2cb7e' }}
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '1.6rem',
                            fontWeight: 700,
                        }}
                    >
                        {auction.currentBid > 0 ? `${auction.currentBid}k` : '—'}
                    </motion.div>
                    {highestBidder && (
                        <div style={{ fontSize: '0.7rem', color: highestBidder.color, marginTop: '0.2rem' }}>
                            {highestBidder.token} {highestBidder.name}
                        </div>
                    )}
                </div>

                {/* Current bidder turn */}
                <div style={{
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    border: '1px solid var(--border-active)',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Most licitál:</div>
                    <div style={{
                        color: currentBidder?.color || '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                    }}>
                        {currentBidder?.token} {currentBidder?.name}
                        <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--gold-light)',
                            fontSize: '0.75rem',
                            marginLeft: '0.5rem',
                        }}>
                            ({currentBidder?.money}k)
                        </span>
                    </div>
                </div>

                {/* Remaining participants */}
                <div style={{
                    display: 'flex',
                    gap: '0.3rem',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                }}>
                    {auction.activeBidders.map((id, i) => {
                        const p = state.players.find(pl => pl.id === id);
                        return (
                            <span key={id} style={{
                                fontSize: '0.65rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: i === auction.currentBidderIndex ? 'rgba(201,168,76,0.2)' : 'var(--bg-surface)',
                                border: i === auction.currentBidderIndex ? '1px solid var(--gold)' : '1px solid var(--border)',
                                color: p?.color || '#888',
                            }}>
                                {p?.token}
                            </span>
                        );
                    })}
                </div>

                {/* Bid controls */}
                <div style={{ marginBottom: '0.75rem' }}>
                    {/* Preset bid buttons */}
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {presetBids.map(b => (
                            <button
                                key={b}
                                onClick={() => setBidAmount(b)}
                                style={{
                                    background: bidAmount === b ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                                    border: bidAmount === b ? '1px solid var(--gold)' : '1px solid var(--border)',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.5rem',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                {b}k
                            </button>
                        ))}
                    </div>

                    {/* Custom bid input */}
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={e => setBidAmount(parseInt(e.target.value) || minBid)}
                            min={minBid}
                            max={maxBid}
                            style={{
                                width: '80px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                padding: '0.35rem 0.5rem',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem',
                                fontFamily: "'JetBrains Mono', monospace",
                                textAlign: 'center',
                            }}
                        />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>k</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        className="btn-primary"
                        onClick={handleBid}
                        disabled={!isHumanTurn || bidAmount <= auction.currentBid || bidAmount > maxBid}
                        style={{ flex: 1, maxWidth: '150px' }}
                        title={!isHumanTurn ? "Várd meg a másik játékost!" : ""}
                    >
                        {isHumanTurn ? `🔨 Licitál: ${bidAmount}k` : '⌛ Várj...'}
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handlePass}
                        disabled={!isHumanTurn}
                        style={{ flex: 1, maxWidth: '150px', opacity: isHumanTurn ? 1 : 0.5 }}
                    >
                        🚫 Passzol
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
