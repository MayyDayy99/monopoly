// ============================================================
// Monopoly by Loricatus HUD — Bal oldali vezérlőpanel
// Az aktuális játékos hatalmas SVG bábuja, neve, egyenlege,
// állapotjelző. Kompakt — a ControlPanel a tábla közepén van.
// ============================================================
import { useGame, useTokenAnimReset } from '../engine/GameHooks';
import { getTokenByEmoji } from './tokens/TokenRegistry';
import { TurnTimer } from './TurnTimer';
import logoKicsi from '../assets/logo_kicsi.png';

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
            {/* ── Logo ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', opacity: 0.8 }}>
                <img src={logoKicsi} alt="Loricatus Logo" style={{ width: '40px', height: 'auto' }} />
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
        </div>
    );
}
