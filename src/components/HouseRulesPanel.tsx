// ============================================================
// HOUSE RULES PANEL — Custom rules toggle UI (#93-97)
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../engine/GameHooks';
import type { HouseRules } from '../types';

const RULES: { key: keyof HouseRules; label: string; description: string; emoji: string }[] = [
    {
        key: 'freeParking_jackpot',
        label: 'Ingyenes Parkoló Jackpot',
        description: 'Az Ingyenes Parkoló mezőre lépve megkapod a begyűjtött adókat/bírságokat.',
        emoji: '🅿️',
    },
    {
        key: 'doubleOnGo',
        label: 'Dupla Start pénz',
        description: 'Ha pontosan a Start mezőre lépsz, dupla fizetést kapsz (400k).',
        emoji: '💵',
    },
    {
        key: 'incomeTax_percentage',
        label: 'Jövedelemadó 10%',
        description: 'A Jövedelemadó mezőnél választhatsz: fix összeg vagy teljes vagyon 10%-a.',
        emoji: '📊',
    },
    {
        key: 'noRentInJail',
        label: 'Börtönben nincs bérlet',
        description: 'Amíg börtönben vagy, az ingatlanjaid nem szednek bérleti díjat.',
        emoji: '🔒',
    },
    {
        key: 'speedMode',
        label: 'Gyors mód',
        description: 'Játékosok extra kezdőingatlanokkal indulnak a gyorsabb játék érdekében.',
        emoji: '⚡',
    },
    {
        key: 'colorblindMode',
        label: 'Színtévesztő mód',
        description: 'Megjeleníti a csoportok rövidítését (pl. PI, KÉ) a mezőkön a könnyebb azonosításhoz.',
        emoji: '👁️',
    },
];

export function HouseRulesPanel() {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const currentRules = state.houseRules || {};

    const toggleRule = (key: keyof HouseRules) => {
        const newRules: HouseRules = {
            ...currentRules,
            [key]: !currentRules[key],
        };
        dispatch({ type: 'SET_HOUSE_RULES', rules: newRules });
    };

    const activeCount = Object.values(currentRules).filter(Boolean).length;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    background: 'var(--bg-surface)',
                    border: activeCount > 0 ? '1px solid var(--gold)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.3rem 0.6rem',
                    color: activeCount > 0 ? 'var(--gold-light)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                }}
            >
                🏠 Házi szabályok
                {activeCount > 0 && (
                    <span style={{
                        background: 'var(--gold)',
                        color: 'var(--bg-board)',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                    }}>
                        {activeCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 150,
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-board)',
                                border: '1px solid var(--border-active)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                maxWidth: '420px',
                                width: '95%',
                            }}
                        >
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                color: 'var(--gold-light)',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                marginBottom: '1rem',
                            }}>
                                🏠 Házi Szabályok
                            </h3>
                            <p style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'center',
                                marginBottom: '1rem',
                            }}>
                                Testreszabhatod a játékot az alábbi szabályokkal.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {RULES.map(rule => (
                                    <button
                                        key={rule.key}
                                        onClick={() => toggleRule(rule.key)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            background: currentRules[rule.key] ? 'rgba(201,168,76,0.1)' : 'var(--bg-surface)',
                                            border: currentRules[rule.key] ? '1px solid var(--gold)' : '1px solid var(--border)',
                                            borderRadius: '8px',
                                            padding: '0.6rem 0.75rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{rule.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 600,
                                                fontSize: '0.8rem',
                                                color: currentRules[rule.key] ? 'var(--gold-light)' : 'var(--text-primary)',
                                            }}>
                                                {rule.label}
                                            </div>
                                            <div style={{
                                                fontSize: '0.65rem',
                                                color: 'var(--text-secondary)',
                                                lineHeight: 1.3,
                                            }}>
                                                {rule.description}
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '36px',
                                            height: '20px',
                                            borderRadius: '10px',
                                            background: currentRules[rule.key] ? 'var(--gold)' : '#353a52',
                                            position: 'relative',
                                            flexShrink: 0,
                                            transition: 'background 0.2s',
                                        }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                background: '#fff',
                                                position: 'absolute',
                                                top: '2px',
                                                left: currentRules[rule.key] ? '18px' : '2px',
                                                transition: 'left 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                            }} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="btn-primary" onClick={() => setIsOpen(false)}>
                                    ✅ Kész
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
