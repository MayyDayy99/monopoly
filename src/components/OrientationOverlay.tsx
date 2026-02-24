import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function OrientationOverlay({ gameStarted }: { gameStarted: boolean }) {
    const [isPortrait, setIsPortrait] = useState(false);
    const [needsFullscreen, setNeedsFullscreen] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const isMobile = window.innerWidth <= 1024;
            const portrait = window.innerHeight > window.innerWidth && isMobile;
            setIsPortrait(portrait);

            // Ismételjük meg, ha fekvőben van, de a böngésző UI elveszi a helyet (nincs fullscreen)
            const isLandscape = window.innerWidth > window.innerHeight && isMobile;
            const notFullscreen = !document.fullscreenElement;
            const hasFullscreenApi = document.documentElement.requestFullscreen !== undefined;

            if (isLandscape && notFullscreen && hasFullscreenApi) {
                setNeedsFullscreen(true);
            } else {
                setNeedsFullscreen(false);
            }
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        document.addEventListener('fullscreenchange', checkOrientation);
        return () => {
            window.removeEventListener('resize', checkOrientation);
            document.removeEventListener('fullscreenchange', checkOrientation);
        };
    }, []);

    const showOverlay = (isPortrait || needsFullscreen) && gameStarted;

    const requestFS = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
        }
    };

    return (
        <AnimatePresence>
            {showOverlay && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        background: 'rgba(5, 7, 12, 0.98)',
                        backdropFilter: 'blur(15px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'white',
                    }}
                >
                    {/* ── Digitális Forgatás Animáció VAGY Fullscreen ikon (3s) ── */}
                    <motion.div
                        style={{
                            position: 'relative',
                            width: '120px',
                            height: '120px',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Radar körök a háttérben */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '1px solid var(--neon-dim)',
                            opacity: 0.3
                        }} />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                inset: '-10px',
                                borderRadius: '50%',
                                border: '1px dashed var(--neon-glow)',
                                opacity: 0.2
                            }}
                        />

                        {/* A telefon ikon forgatása vagy Képernyő Maximalizálás */}
                        <motion.div
                            animate={isPortrait ? {
                                rotate: [0, 90, 90, 0],
                                scale: [1, 1.1, 1.1, 1]
                            } : { scale: [1, 1.1, 1] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                times: isPortrait ? [0, 0.4, 0.6, 1] : [0, 0.5, 1],
                                ease: "easeInOut"
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isPortrait ? (
                                <svg width="60" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px var(--neon-glow))' }}>
                                    <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
                                    <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" />
                                    <path d="M17 2H7" opacity="0.3" />
                                </svg>
                            ) : (
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px var(--neon-glow))' }}>
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* ── Szöveges tartalom ── */}
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            color: 'var(--neon)',
                            textTransform: 'uppercase',
                            marginBottom: '1rem',
                            textShadow: '0 0 20px var(--neon-glow)'
                        }}
                    >
                        {isPortrait ? 'Digitális Korrekció Szükséges' : 'Teljes Képernyős Mód'}
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '280px',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem'
                        }}
                    >
                        {isPortrait
                            ? <span>A <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>rendszer optimalizálása</span> érdekében fordítsd el a telefont fekvő helyzetbe!</span>
                            : <span>A HUD <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>hiánytalan megjelenítéséhez</span> rejtsd el a böngésző sávjait!</span>
                        }
                    </motion.p>

                    {!isPortrait && (
                        <button
                            className="btn-primary"
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                marginBottom: '2rem',
                                boxShadow: '0 0 20px rgba(199, 254, 27, 0.4)'
                            }}
                            onClick={requestFS}
                        >
                            FULLSCREEN AKTIVÁLÁSA
                        </button>
                    )}

                    {/* ── 3 mp-es progress bar (Díszítés és visszaszámlálás érzet) ── */}
                    <div style={{
                        width: '180px',
                        height: '3px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(90deg, transparent, var(--neon), transparent)',
                                boxShadow: '0 0 10px var(--neon-glow)'
                            }}
                        />
                    </div>

                    <p style={{
                        marginTop: '1.5rem',
                        fontSize: '0.65rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'rgba(199, 254, 27, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em'
                    }}>
                        Loricatus Systems • OS Update v4.2
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
