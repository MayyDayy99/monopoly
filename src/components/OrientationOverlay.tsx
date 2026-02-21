import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A Loricatus HQ-ból származó tájékoztató overlay, 
 * amely kéri a felhasználót, hogy fordítsa el az eszközt.
 */
export function OrientationOverlay() {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Csak mobilon/tableten (max 1024px) és csak álló módban
            const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
            setIsPortrait(portrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    return (
        <AnimatePresence>
            {isPortrait && (
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
                    {/* ── Digitális Forgatás Animáció (3s) ── */}
                    <motion.div
                        style={{
                            position: 'relative',
                            width: '120px',
                            height: '120px',
                            marginBottom: '2.5rem',
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

                        {/* A telefon ikon forgatása */}
                        <motion.div
                            animate={{
                                rotate: [0, 90, 90, 0],
                                scale: [1, 1.1, 1.1, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                times: [0, 0.4, 0.6, 1],
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
                            <svg width="60" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px var(--neon-glow))' }}>
                                <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
                                <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" />
                                <path d="M17 2H7" opacity="0.3" />
                            </svg>
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
                        Digitális Korrekció Szükséges
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
                            marginBottom: '2.5rem'
                        }}
                    >
                        A <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>rendszer optimalizálása</span> érdekében fordítsd el a telefont fekvő helyzetbe!
                    </motion.p>

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
