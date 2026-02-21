// ============================================================
// WINNER SCREEN — Victory overlay with detailed stats (#85)
// ============================================================
import { motion } from 'framer-motion';
import logoKicsi from '../assets/logo_kicsi.png';
import { useGame } from '../engine/GameHooks';
import { clearSave } from '../engine/storage';
import { calculateNetWorth } from '../engine/gameLogic';

export function WinnerScreen() {
    const { state } = useGame();

    if (state.phase !== 'game-over' || !state.winner) return null;

    const winner = state.players.find(p => p.id === state.winner);
    if (!winner) return null;

    const handleReload = () => {
        clearSave();
        window.location.reload();
    };

    // Calculate stats
    const ownedCount = Object.values(state.ownedProperties).filter(o => o.ownerId === winner.id).length;
    const housesBuilt = Object.values(state.ownedProperties)
        .filter(o => o.ownerId === winner.id)
        .reduce((sum, o) => sum + o.houses, 0);
    const hotelsBuilt = Object.values(state.ownedProperties)
        .filter(o => o.ownerId === winner.id)
        .filter(o => o.hasHotel).length;

    const netWorth = calculateNetWorth(state, winner.id);

    const totalRounds = Math.ceil(state.logs.filter(l => l.type === 'system' && l.message.includes('köre következik')).length / Math.max(1, state.players.length));
    const bankruptPlayers = state.players.filter(p => p.isBankrupt);

    // Rankings
    const rankings = [...state.players].sort((a, b) => {
        if (a.isBankrupt && !b.isBankrupt) return 1;
        if (!a.isBankrupt && b.isBankrupt) return -1;
        return b.money - a.money;
    });

    return (
        <div className="winner-overlay">
            <motion.div
                className="winner-card"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            >
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
                >
                    <img src={logoKicsi} alt="Loricatus Logo" style={{ width: '100px', height: 'auto', filter: 'drop-shadow(0 0 20px var(--neon))' }} />
                </motion.div>
                <h1>Győzelem!</h1>
                <div className="winner-name">
                    <span style={{ color: winner.color }}>{winner.token} {winner.name}</span>
                </div>

                {/* Stats grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                        maxWidth: '360px',
                        margin: '0 auto 1.5rem',
                    }}
                >
                    <StatBox label="Végső egyenleg" value={`${winner.money.toLocaleString()}k`} icon="💰" />
                    <StatBox label="Teljes vagyon" value={`${netWorth.toLocaleString()}k`} icon="💎" />
                    <StatBox label="Ingatlanok" value={`${ownedCount}`} icon="🏠" />
                    <StatBox label="Házak / Szállodák" value={`${housesBuilt} / ${hotelsBuilt}`} icon="🏗️" />
                    <StatBox label="Körök" value={`~${totalRounds}`} icon="🔄" />
                    <StatBox label="Csődbe jutottak" value={`${bankruptPlayers.length}`} icon="💀" />
                </motion.div>

                {/* Player rankings */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{ marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}
                >
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                    }}>
                        Végső sorrend
                    </div>
                    {rankings.map((p, i) => (
                        <div
                            key={p.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                background: i === 0 ? 'rgba(201,168,76,0.1)' : 'transparent',
                                border: i === 0 ? '1px solid var(--border-active)' : '1px solid transparent',
                                marginBottom: '0.25rem',
                            }}
                        >
                            <span style={{ fontSize: '0.8rem', width: '20px', textAlign: 'center' }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                            </span>
                            <span style={{ color: p.color, fontWeight: 600, fontSize: '0.8rem' }}>
                                {p.token} {p.name}
                            </span>
                            <span style={{
                                marginLeft: 'auto',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.75rem',
                                color: p.isBankrupt ? '#f87171' : 'var(--gold-light)',
                            }}>
                                {p.isBankrupt ? 'CSŐD' : `${p.money.toLocaleString()}k`}
                            </span>
                        </div>
                    ))}
                </motion.div>

                <motion.button
                    className="btn-primary"
                    onClick={handleReload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        fontSize: '1.1rem',
                        padding: '0.8rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem'
                    }}
                >
                    <img src={logoKicsi} alt="" style={{ width: '20px', height: 'auto' }} />
                    Új játék
                </motion.button>
            </motion.div>
        </div>
    );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.5rem',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>{icon}</div>
            <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.9rem',
                color: 'var(--gold-light)',
                fontWeight: 700,
            }}>
                {value}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{label}</div>
        </div>
    );
}
