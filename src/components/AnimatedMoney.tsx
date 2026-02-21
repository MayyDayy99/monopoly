import { useState, useEffect, useRef } from 'react';

interface AnimatedMoneyProps {
    value: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
    suffix?: string;
}

export function AnimatedMoney({
    value,
    duration = 500,
    className,
    style,
    suffix = 'k',
}: AnimatedMoneyProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [prevVal, setPrevVal] = useState(value);
    const prevValueRef = useRef(value);
    const animationRef = useRef<number | null>(null);
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);

    // #Audit fix: Adjust state when props change (standard React pattern)
    if (value !== prevVal) {
        setPrevVal(value);
        setFlash(value > prevVal ? 'up' : 'down');
    }

    useEffect(() => {
        // Clear flash after some time
        let flashTimeout: ReturnType<typeof setTimeout> | null = null;
        if (flash) {
            flashTimeout = setTimeout(() => setFlash(null), 600);
        }

        const from = prevValueRef.current;
        const to = value;
        prevValueRef.current = value;

        if (from === to) return;

        const start = performance.now();
        const step = (timestamp: number) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * eased);
            setDisplayValue(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(step);
            }
        };

        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(step);

        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
            if (flashTimeout) clearTimeout(flashTimeout);
        };
    }, [value, duration]);

    const flashStyle: React.CSSProperties = flash === 'up'
        ? { color: '#4ade80', transition: 'color 0.3s' }
        : flash === 'down'
            ? { color: '#f87171', transition: 'color 0.3s' }
            : {};

    return (
        <span className={className} style={{ ...style, ...flashStyle }}>
            {displayValue.toLocaleString()}{suffix}
        </span>
    );
}
