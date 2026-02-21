import { motion, AnimatePresence } from 'framer-motion';
import type { DiceResult } from '../types';

interface DiceProps {
    result: DiceResult | null;
    rolling: boolean;
}

// Dot positions for die faces (3x3 grid, 1-indexed)
const DOT_POSITIONS: Record<number, number[]> = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
};

function DieFace({ value, rolling }: { value: number; rolling: boolean }) {
    const positions = DOT_POSITIONS[value] || [];

    return (
        <motion.div
            className="die"
            animate={rolling ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 180, 360],
                scale: [1, 0.8, 1],
            } : {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
            }}
            transition={{
                duration: rolling ? 0.6 : 0.3,
                ease: "easeOut",
            }}
        >
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                    gridColumn: (i % 3) + 1,
                    gridRow: Math.floor(i / 3) + 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {positions.includes(i + 1) && <div className="die-dot" />}
                </div>
            ))}
        </motion.div>
    );
}

export function Dice({ result, rolling }: DiceProps) {
    return (
        <div className="dice-container" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                <DieFace
                    key={`d1-${result?.die1 || 0}`}
                    value={result?.die1 || 1}
                    rolling={rolling}
                />
                <DieFace
                    key={`d2-${result?.die2 || 0}`}
                    value={result?.die2 || 1}
                    rolling={rolling}
                />
            </AnimatePresence>
        </div>
    );
}
