// ============================================================
// SPLASH SCREEN — Loricatus branded intro (automatikusan eltűnik)
// ============================================================
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoKicsi from '../assets/logo_kicsi.png';

interface SplashScreenProps {
    onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence onExitComplete={onDone}>
            {visible && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#05070a',
                        backgroundImage: `
                            radial-gradient(circle at 50% 40%, rgba(199,254,27,0.07) 0%, transparent 60%),
                            linear-gradient(to right, rgba(30,41,59,0.15) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(30,41,59,0.15) 1px, transparent 1px)
                        `,
                        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
                        cursor: 'pointer',
                    }}
                    onClick={() => setVisible(false)}
                >
                    {/* Logo megjelenés */}
                    <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{ marginBottom: '2rem', filter: 'drop-shadow(0 0 40px rgba(199,254,27,0.5))' }}
                    >
                        <img src={logoKicsi} alt="Loricatus" style={{ width: '120px', height: 'auto' }} />
                    </motion.div>

                    {/* Cím */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                            fontWeight: 900,
                            color: '#c7fe1b',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            textShadow: '0 0 30px rgba(199,254,27,0.6)',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Monopoly by Loricatus
                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                            color: 'rgba(199,254,27,0.55)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '3rem',
                        }}
                    >
                        Digitalizáld a múltat, építsd a jövőt!
                    </motion.div>

                    {/* Betöltő progress bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        style={{ width: '200px', position: 'relative' }}
                    >
                        <div style={{
                            height: '2px',
                            background: 'rgba(199,254,27,0.1)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                        }}>
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 1.1, duration: 1.3, ease: 'easeInOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(to right, #c7fe1b, #0ea5e9)',
                                    boxShadow: '0 0 8px rgba(199,254,27,0.8)',
                                    borderRadius: '2px',
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Kattintásra kihagyás */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        style={{
                            marginTop: '2rem',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.65rem',
                            color: '#c7fe1b',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                        }}
                    >
                        kattints a kihagyáshoz
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
