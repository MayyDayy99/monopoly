import { useState, useCallback } from 'react';
import logoKicsi from '../assets/logo_kicsi.png';
import { TradeModal } from './TradeModal';
import { motion } from 'framer-motion';
import { useGame, useTurnTimerExpired } from '../engine/GameHooks';
import { BOARD_SPACES } from '../data/board';
import { Dice } from './Dice';
import { canRaiseFunds } from '../engine/gameLogic';

export function ControlPanel() {
    const { state, dispatch } = useGame();
    const isExpired = useTurnTimerExpired();
    const [rolling, setRolling] = useState(false);
    const currentPlayer = state.players[state.currentPlayerIndex];

    const handleRoll = useCallback(() => {
        if (state.phase !== 'rolling' || rolling) return;
        setRolling(true);
        setTimeout(() => {
            dispatch({ type: 'ROLL_DICE' });
            setRolling(false);
        }, 600);
    }, [state.phase, rolling, dispatch]);

    if (!currentPlayer || state.phase === 'setup' || state.phase === 'game-over') return null;

    const currentSpace = BOARD_SPACES[currentPlayer.position];
    const isInDebt = currentPlayer.money < 0;
    const canLiquidate = canRaiseFunds(state, currentPlayer.id);

    const handleBuy = () => {
        dispatch({ type: 'BUY_PROPERTY' });
    };

    const handleEndTurn = () => {
        dispatch({ type: 'END_TURN' });
    };

    const handlePayFine = () => {
        dispatch({ type: 'PAY_JAIL_FINE' });
    };

    const handleUseJailCard = () => {
        dispatch({ type: 'USE_JAIL_CARD' });
    };

    const handleResolveCard = () => {
        dispatch({ type: 'RESOLVE_CARD' });
    };

    const price = currentSpace?.property?.price || currentSpace?.railroad?.price || currentSpace?.utility?.price || 0;
    const canAfford = currentPlayer.money >= price;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            width: '100%',
            maxWidth: '320px',
        }}>
            {/* Dice Section */}
            <div style={{
                background: 'rgba(26, 29, 40, 0.4)',
                backdropFilter: 'blur(4px)',
                borderRadius: '12px',
                padding: '0.8rem',
                border: '1px solid rgba(199, 254, 27, 0.1)',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
                <Dice result={state.dice} rolling={rolling} />
            </div>

            {/* Action Buttons Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                width: '100%',
            }}>

                {/* ── IDŐ LEJÁRT → villogó Kör átadása gomb ── */}
                {isExpired && state.phase !== 'turn-end' && (
                    <button
                        className="btn-primary blink-urgent"
                        onClick={handleEndTurn}
                        style={{ fontSize: '1rem', padding: '0.7rem' }}
                    >
                        ⏩ Kör átadása
                    </button>
                )}

                {/* Rolling phase */}
                {state.phase === 'rolling' && !currentPlayer.inJail && !isExpired && (
                    <button
                        className="btn-primary"
                        onClick={handleRoll}
                        disabled={rolling}
                        style={{
                            fontSize: '1rem',
                            padding: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem'
                        }}
                    >
                        <img src={logoKicsi} alt="" style={{ width: '18px', height: 'auto' }} />
                        Dobás!
                    </button>
                )}

                {state.phase === 'rolling' && currentPlayer.inJail && !isExpired && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <button className="btn-primary" onClick={() => dispatch({ type: 'TRY_JAIL_DOUBLES' })} disabled={rolling}>
                            🎲 Dupla próbálkozás
                        </button>
                        <button className="btn-secondary" onClick={handlePayFine} disabled={rolling || currentPlayer.money < 50}>
                            💰 Bírság fizetése (50k)
                        </button>
                        {currentPlayer.hasGetOutOfJailCard > 0 && (
                            <button className="btn-secondary" onClick={handleUseJailCard} disabled={rolling}>
                                🃏 Kártya használata
                            </button>
                        )}
                    </div>
                )}

                {/* Landed phase UI */}
                {state.phase === 'landed' && currentSpace && !isExpired && (
                    <>
                        <button
                            className="btn-primary"
                            onClick={handleBuy}
                            disabled={!canAfford}
                        >
                            🏠 Megveszi: {currentSpace.name} ({price}k)
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => dispatch({ type: 'DECLINE_PROPERTY' })}
                        >
                            🔨 Nem veszi meg (Árverés)
                        </button>
                    </>
                )}

                {/* Card drawn */}
                {state.phase === 'card-drawn' && state.drawnCard && !isExpired && (
                    <motion.div
                        className="drawn-card"
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            position: 'relative',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--gold)',
                            borderRadius: '12px',
                            padding: '1rem',
                            textAlign: 'center',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <h4 style={{
                            fontFamily: "'Playfair Display', serif",
                            color: 'var(--gold-light)',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                        }}>
                            {state.drawnCard.type === 'chance' ? '❓ Esély' : '🏛️ Közösségi Alap'}
                        </h4>
                        <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                            {state.drawnCard.text}
                        </p>
                        <button className="btn-primary" onClick={handleResolveCard}>
                            Rendben
                        </button>
                    </motion.div>
                )}

                {/* End turn + Trade + Debt Management */}
                {state.phase === 'turn-end' && (
                    <>
                        {isInDebt ? (
                            <>
                                {canLiquidate ? (
                                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px dashed #ef4444' }}>
                                        <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '0.4rem' }}>
                                            Rendezd a tartozásodat eladással vagy jelzáloggal!
                                        </p>
                                        <button className="btn-danger" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
                                            ▶️ Tartozás fennáll
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn-danger animate-pulse"
                                        onClick={() => dispatch({ type: 'DECLARE_BANKRUPTCY' })}
                                        style={{ background: '#b91c1c' }}
                                    >
                                        💥 Csőd bejelentése
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                className={`btn-primary ${isExpired ? 'blink-urgent' : 'animate-pulse-gold'}`}
                                onClick={handleEndTurn}
                            >
                                ⏩ Kör átadása
                            </button>
                        )}
                        {!isExpired && <TradeModal disabled={isExpired} />}
                    </>
                )}

                {/* Double notification */}
                {state.dice?.isDouble && state.phase === 'turn-end' && !currentPlayer.inJail && state.doublesCount > 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--gold-light)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                    }}>
                        🎯 Dupla dobás — újra jössz!
                    </div>
                )}
            </div>

            {/* Quick Info */}
            <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem',
            }}>
                📍 {currentSpace?.name || '—'} • 📊 {state.houses_available} LOD • 🌐 {state.hotels_available} DT
            </div>
        </div>
    );
}
