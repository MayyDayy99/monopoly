// ============================================================
// Monopoly by Loricatus HUD — Bal oldali vezérlőpanel
// Az aktuális játékos hatalmas SVG bábuja, neve, egyenlege,
// állapotjelző. Kompakt — a ControlPanel a tábla közepén van.
// ============================================================
import { useState } from 'react';
import { useGame, useTokenAnimReset } from '../engine/GameHooks';
import { getTokenByEmoji } from './tokens/TokenRegistry';
import { TurnTimer } from './TurnTimer';
import logoKicsi from '../assets/logo_kicsi.png';
import { clearSave, hasSavedGame } from '../engine/storage';
import { motion, AnimatePresence } from 'framer-motion';

export function LoricatusHUD() {
    const { state } = useGame();

    // Állapotalapú animáció auto-reset
    useTokenAnimReset();

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || state.phase === 'setup' || state.phase === 'game-over') return null;

    const tokenDef = getTokenByEmoji(currentPlayer.token);
    const TokenComponent = tokenDef.component;

    return (
        <div className="hud-current-player">
            {/* ── Logo & Fullscreen ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                <button
                    onClick={() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch(e => console.error(e));
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    className="fullscreen-btn"
                    title="Teljes képernyő"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
                    <img src={logoKicsi} alt="Loricatus Logo" style={{ width: '40px', height: 'auto' }} />
                    <div style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        marginTop: '0.4rem',
                        color: 'var(--neon)',
                        textTransform: 'uppercase'
                    }}>
                        Monopoly by Loricatus
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '0.1rem' }}>
                        3D Digitalizáció
                    </div>
                </div>
            </div>

            {/* ── Nagy token konténer ── */}
            <div className="hud-token-container" data-state={state.tokenAnimState}>
                <div className="hud-token-glow" style={{
                    '--player-color': currentPlayer.color,
                } as React.CSSProperties} />
                <TokenComponent
                    size={110}
                    color={currentPlayer.color}
                    isAnimating={true}
                    label={currentPlayer.name}
                    tokenState={state.tokenAnimState}
                />
                <div className="hud-token-name">{tokenDef.name}</div>
            </div>

            {/* ── Játékos infó ── */}
            <div className="hud-player-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div className="hud-player-name" style={{ color: currentPlayer.color, margin: 0 }}>
                        {currentPlayer.isBot ? '🤖 ' : ''}{currentPlayer.name}
                    </div>
                    <TurnTimer />
                </div>
                <div className="hud-player-balance">
                    <span className="hud-balance-label">Egyenleg</span>
                    <span className="hud-balance-value">{currentPlayer.money.toLocaleString()}k</span>
                </div>
                <div className="hud-player-props">
                    📊 {currentPlayer.properties.length} ingatlan
                </div>
            </div>

            {/* ── Token Állapot jelző ── */}
            <div className="hud-state-indicator" data-state={state.tokenAnimState}>
                <span className="hud-state-dot" />
                <span className="hud-state-text">
                    {state.tokenAnimState === 'IDLE' && '⏸ Várakozik'}
                    {state.tokenAnimState === 'MOVING' && '🚀 Mozgásban'}
                    {state.tokenAnimState === 'ACTION' && '📡 Szkennelés'}
                </span>
            </div>

            {/* ── MENTETT JÁTÉK OVERLAY ── */}
            <ResumeOverlay />
        </div>
    );
}

function ResumeOverlay() {
    const saved = hasSavedGame();
    const [visible, setVisible] = useState(saved);

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    background: 'rgba(26, 29, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--neon)',
                    borderRadius: '12px',
                    padding: '1rem',
                    zIndex: 100,
                    boxShadow: '0 0 20px rgba(199, 254, 27, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💾</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--neon)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Mentett állapot észlelve
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                            A rendszer automatikusan betöltötte a legutóbbi adatokat.
                        </div>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                        ✕
                    </button>
                </div>

                <button
                    className="btn-secondary"
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        fontSize: '0.7rem',
                        padding: '0.5rem'
                    }}
                    onClick={() => {
                        if (confirm("Biztosan törlöd a mentést és új missziót indítasz?")) {
                            clearSave();
                            window.location.reload();
                        }
                    }}
                >
                    🗑️ ADATOK TÖRLÉSE & ÚJ MISSZIÓ
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
