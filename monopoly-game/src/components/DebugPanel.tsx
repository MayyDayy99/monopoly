// ============================================================
// DEBUG PANEL — Developer tools (#9, #99)
// Ctrl+Shift+D to toggle. Hidden in production builds.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../engine/GameHooks';
import { BOARD_SPACES } from '../data/board';
import { clearSave } from '../engine/storage';

export function DebugPanel() {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [moneyInput, setMoneyInput] = useState('');
    const [posInput, setPosInput] = useState('');
    const [die1Input, setDie1Input] = useState('');
    const [die2Input, setDie2Input] = useState('');

    // Ctrl+Shift+D toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const currentPlayer = state.players[state.currentPlayerIndex];

    const setMoney = useCallback(() => {
        if (!currentPlayer || !moneyInput) return;
        const amount = parseInt(moneyInput);
        if (isNaN(amount)) return;
        // We dispatch a special debug action by directly manipulating
        // For now, use the direct state approach via a custom action
        dispatch({
            type: 'DEBUG_SET_MONEY' as never,
            playerId: currentPlayer.id,
            amount,
        } as never);
    }, [currentPlayer, moneyInput, dispatch]);

    const setPosition = useCallback(() => {
        if (!currentPlayer || !posInput) return;
        const pos = parseInt(posInput);
        if (isNaN(pos) || pos < 0 || pos > 39) return;
        dispatch({
            type: 'DEBUG_SET_POSITION' as never,
            playerId: currentPlayer.id,
            position: pos,
        } as never);
    }, [currentPlayer, posInput, dispatch]);

    const forceDice = useCallback(() => {
        const d1 = parseInt(die1Input);
        const d2 = parseInt(die2Input);
        if (isNaN(d1) || isNaN(d2) || d1 < 1 || d1 > 6 || d2 < 1 || d2 > 6) return;
        dispatch({
            type: 'DEBUG_FORCE_DICE' as never,
            die1: d1,
            die2: d2,
        } as never);
    }, [die1Input, die2Input, dispatch]);

    const giveProperty = useCallback((spaceId: number) => {
        if (!currentPlayer) return;
        dispatch({
            type: 'DEBUG_GIVE_PROPERTY' as never,
            playerId: currentPlayer.id,
            spaceId,
        } as never);
    }, [currentPlayer, dispatch]);

    const handleClearSave = () => {
        clearSave();
        alert('Mentés törölve!');
    };

    if (!isOpen) return null;

    // Check if we're in production
    if (import.meta.env.PROD) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: '#1a1d28',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '1rem',
            zIndex: 9999,
            width: '320px',
            maxHeight: '90vh',
            overflow: 'auto',
            color: '#eae8e0',
            fontSize: '0.8rem',
            boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
                    🔧 DEBUG PANEL
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ✕
                </button>
            </div>

            {/* State Info */}
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem', background: '#22263a', borderRadius: '6px' }}>
                <div><strong>Phase:</strong> {state.phase}</div>
                <div><strong>Aktuális:</strong> {currentPlayer?.name} ({currentPlayer?.id})</div>
                <div><strong>Pozíció:</strong> {currentPlayer?.position} ({BOARD_SPACES[currentPlayer?.position || 0]?.name})</div>
                <div><strong>Pénz:</strong> {currentPlayer?.money}k</div>
                <div><strong>Dupla count:</strong> {state.doublesCount}</div>
                <div><strong>Börtön:</strong> {currentPlayer?.inJail ? `Igen (${currentPlayer.jailTurns}/3)` : 'Nem'}</div>
            </div>

            {/* Set Money */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9a97a0', marginBottom: '0.2rem' }}>
                    💰 Pénz beállítása
                </label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                        type="number"
                        value={moneyInput}
                        onChange={e => setMoneyInput(e.target.value)}
                        placeholder="pl. 5000"
                        style={{
                            flex: 1,
                            background: '#353a52',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            padding: '0.3rem',
                            color: '#eae8e0',
                            fontSize: '0.8rem',
                        }}
                    />
                    <button onClick={setMoney} style={debugBtnStyle}>Beállít</button>
                </div>
            </div>

            {/* Set Position */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9a97a0', marginBottom: '0.2rem' }}>
                    📍 Pozíció beállítása (0-39)
                </label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                        type="number"
                        value={posInput}
                        onChange={e => setPosInput(e.target.value)}
                        placeholder="0-39"
                        min={0}
                        max={39}
                        style={{
                            flex: 1,
                            background: '#353a52',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            padding: '0.3rem',
                            color: '#eae8e0',
                            fontSize: '0.8rem',
                        }}
                    />
                    <button onClick={setPosition} style={debugBtnStyle}>Beállít</button>
                </div>
            </div>

            {/* Force Dice */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9a97a0', marginBottom: '0.2rem' }}>
                    🎲 Kocka kényszerítés (következő dobás)
                </label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input
                        type="number"
                        value={die1Input}
                        onChange={e => setDie1Input(e.target.value)}
                        placeholder="K1"
                        min={1}
                        max={6}
                        style={{
                            width: '50px',
                            background: '#353a52',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            padding: '0.3rem',
                            color: '#eae8e0',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                        }}
                    />
                    <input
                        type="number"
                        value={die2Input}
                        onChange={e => setDie2Input(e.target.value)}
                        placeholder="K2"
                        min={1}
                        max={6}
                        style={{
                            width: '50px',
                            background: '#353a52',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            padding: '0.3rem',
                            color: '#eae8e0',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                        }}
                    />
                    <button onClick={forceDice} style={debugBtnStyle}>Beállít</button>
                </div>
            </div>

            {/* Quick give property */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#9a97a0', marginBottom: '0.2rem' }}>
                    🏠 Gyors ingatlan adás (aktív játékosnak)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {[1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24].map(sid => (
                        <button
                            key={sid}
                            onClick={() => giveProperty(sid)}
                            disabled={!!state.ownedProperties[sid]}
                            style={{
                                ...debugBtnStyle,
                                fontSize: '0.6rem',
                                padding: '0.15rem 0.3rem',
                                opacity: state.ownedProperties[sid] ? 0.3 : 1,
                            }}
                            title={BOARD_SPACES[sid].name}
                        >
                            {sid}
                        </button>
                    ))}
                </div>
            </div>

            {/* Utilities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                <button onClick={handleClearSave} style={{ ...debugBtnStyle, background: '#991b1b' }}>
                    🗑️ Mentés törlése
                </button>
                <button onClick={() => window.location.reload()} style={debugBtnStyle}>
                    🔄 Újratöltés
                </button>
            </div>

            <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                Ctrl+Shift+D a bezáráshoz
            </div>
        </div>
    );
}

const debugBtnStyle: React.CSSProperties = {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
};
