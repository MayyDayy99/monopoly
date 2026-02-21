import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HouseRulesPanel } from './HouseRulesPanel';
import { TOKEN_REGISTRY } from './tokens/TokenRegistry';
import { LoricatusBackground } from './LoricatusBackground';

interface PlayerConfig {
    id: string;
    name: string;
    color: string;
    token: string;
    isBot: boolean;
}

const AVAILABLE_TOKENS = TOKEN_REGISTRY.map(t => t.emoji);
const PLAYER_COLORS = ['#c7fe1b', '#0ea5e9', '#e879f9', '#fb923c'];
const BOT_NAMES = ['Drón-AI 🤖', 'ScanBot 🤖', 'LiDAR-AI 🤖', 'AvataBot 🤖'];

interface PlayerSetupProps {
    onStart: (players: PlayerConfig[]) => void;
}

export function PlayerSetup({ onStart }: PlayerSetupProps) {
    const [playerCount, setPlayerCount] = useState(2);
    const [showBotHint, setShowBotHint] = useState(true);
    const [hoveredBotBtn, setHoveredBotBtn] = useState<number | null>(null);
    const [players, setPlayers] = useState<PlayerConfig[]>([
        { id: 'p1', name: 'Játékos 1', color: PLAYER_COLORS[0], token: AVAILABLE_TOKENS[0], isBot: false },
        { id: 'p2', name: 'Játékos 2', color: PLAYER_COLORS[1], token: AVAILABLE_TOKENS[1], isBot: false },
        { id: 'p3', name: 'Játékos 3', color: PLAYER_COLORS[2], token: AVAILABLE_TOKENS[2], isBot: false },
        { id: 'p4', name: 'Játékos 4', color: PLAYER_COLORS[3], token: AVAILABLE_TOKENS[3], isBot: false },
    ]);

    const updatePlayer = (index: number, field: keyof PlayerConfig, value: string | boolean) => {
        const updated = [...players];
        updated[index] = { ...updated[index], [field]: value };
        // When toggling bot, set a default bot name
        if (field === 'isBot' && value === true) {
            updated[index].name = BOT_NAMES[index] || `Bot ${index + 1}`;
        } else if (field === 'isBot' && value === false) {
            updated[index].name = `Játékos ${index + 1}`;
        }
        setPlayers(updated);
    };

    const usedTokens = players.slice(0, playerCount).map(p => p.token);

    return (
        <div className="setup-container">
            <LoricatusBackground />
            <motion.div
                className="setup-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h1 className="setup-title">LORICATUS-OPOLY</h1>
                <p className="setup-subtitle">Magyar Műemlékek • 3D Digitalizáció • Tech-Noir</p>

                {/* Player Count */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                        display: 'block',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Játékosok száma
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[2, 3, 4].map(n => (
                            <button
                                key={n}
                                className={n === playerCount ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setPlayerCount(n)}
                                style={{ flex: 1 }}
                            >
                                {n} játékos
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bot Hint Banner */}
                <AnimatePresence>
                    {showBotHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="bot-hint-banner"
                        >
                            <div className="bot-hint-content">
                                <span className="bot-hint-icon">🤖</span>
                                <span className="bot-hint-text">
                                    <strong>Tipp:</strong> Kattints a <span className="bot-hint-icon-inline">👤</span> ikonra bármelyik játékosnál a <strong>bot mód</strong> bekapcsolásához!
                                </span>
                            </div>
                            <button
                                className="bot-hint-close"
                                onClick={() => setShowBotHint(false)}
                                aria-label="Bezárás"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player Inputs */}
                {Array.from({ length: playerCount }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginBottom: '0.75rem',
                            padding: '0.5rem',
                            background: 'var(--bg-surface)',
                            borderRadius: '10px',
                            border: `1px solid ${players[i].color}33`,
                        }}
                    >
                        {/* Token selector */}
                        <select
                            value={players[i].token}
                            onChange={e => updatePlayer(i, 'token', e.target.value)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.3rem',
                                fontSize: '0.7rem',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                width: '80px',
                                fontFamily: "'JetBrains Mono', monospace",
                            }}
                        >
                            {TOKEN_REGISTRY.map(t => (
                                <option
                                    key={t.emoji}
                                    value={t.emoji}
                                    disabled={usedTokens.includes(t.emoji) && players[i].token !== t.emoji}
                                >
                                    {t.emoji} {t.name}
                                </option>
                            ))}
                        </select>

                        {/* Name input */}
                        <input
                            className="setup-input"
                            value={players[i].name}
                            onChange={e => updatePlayer(i, 'name', e.target.value)}
                            placeholder={`Játékos ${i + 1} neve`}
                            maxLength={15}
                            style={{ flex: 1, minWidth: 0 }}
                        />

                        {/* Bot toggle (#73) */}
                        <div className="bot-toggle-wrapper"
                            onMouseEnter={() => setHoveredBotBtn(i)}
                            onMouseLeave={() => setHoveredBotBtn(null)}
                        >
                            <motion.button
                                onClick={() => {
                                    updatePlayer(i, 'isBot', !players[i].isBot);
                                    if (!players[i].isBot) setShowBotHint(false);
                                }}
                                title={players[i].isBot ? 'AI bot — kattints az emberi játékoshoz' : 'Kattints a bot módhoz'}
                                className={`bot-toggle-btn ${players[i].isBot ? 'bot-active' : ''} ${!players[i].isBot && showBotHint ? 'bot-toggle-pulse' : ''}`}
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.span
                                    key={players[i].isBot ? 'bot' : 'human'}
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ display: 'inline-block' }}
                                >
                                    {players[i].isBot ? '🤖' : '👤'}
                                </motion.span>
                            </motion.button>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {hoveredBotBtn === i && (
                                    <motion.div
                                        className="bot-tooltip"
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {players[i].isBot ? 'Kattints az emberi módhoz' : 'Kattints a bot módhoz'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Color indicator */}
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: players[i].color,
                            flexShrink: 0,
                            boxShadow: `0 0 8px ${players[i].color}66`,
                        }} />
                    </motion.div>
                ))}

                {/* House Rules button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <HouseRulesPanel />
                </div>

                {/* Start Button */}
                <motion.button
                    className="btn-primary"
                    onClick={() => onStart(players.slice(0, playerCount))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        padding: '0.8rem',
                        fontSize: '1.1rem',
                        letterSpacing: '0.05em',
                    }}
                >
                    🎲 Játék indítása!
                </motion.button>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    marginTop: '1rem',
                    opacity: 0.6,
                }}>
                    Loricatus Group • Pass-and-play • Kezdőtőke: 1500k • 🤖 Bot mód
                </p>
            </motion.div>
        </div>
    );
}
