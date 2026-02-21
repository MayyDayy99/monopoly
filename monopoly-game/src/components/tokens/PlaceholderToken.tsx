// ============================================================
// PLACEHOLDER TOKEN — Ideiglenes dummy bábu a scaffolding fázishoz
// A végleges SVG animált token komponensek (Drón, Szkenner, Robotkutya)
// ide fognak bekerülni, ugyanezzel az interfesszel.
// ============================================================

interface PlaceholderTokenProps {
    /** A bábu mérete pixelben */
    size?: number;
    /** A bábu színe (játékos szín) */
    color?: string;
    /** Aktív animáció állapot (jövőbeli SVG animációkhoz) */
    isAnimating?: boolean;
    /** Játékos neve tooltip-hez */
    label?: string;
}

/**
 * Ideiglenes placeholder token: egyszerű színes négyzet a pozicionálás
 * és az overlay réteg teszteléséhez. Később SVG komponensekre cserélendő.
 */
export function PlaceholderToken({
    size = 24,
    color = '#c7fe1b',
    isAnimating = false,
    label = '',
}: PlaceholderTokenProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            role="img"
            aria-label={label || 'Játékos token'}
            style={{ overflow: 'visible' }}
        >
            {/* Külső glow effekt — Loricatus neon */}
            <defs>
                <filter id={`glow-${color.replace('#', '')}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Fő forma: lekerekített négyzet */}
            <rect
                x="10"
                y="10"
                width="80"
                height="80"
                rx="16"
                ry="16"
                fill={color}
                stroke="#0f172a"
                strokeWidth="4"
                filter={isAnimating ? `url(#glow-${color.replace('#', '')})` : undefined}
            />

            {/* Belső kereszt (scaffold jelölő) */}
            <line x1="30" y1="30" x2="70" y2="70" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

            {/* Pulzáló animáció ha aktív */}
            {isAnimating && (
                <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    rx="16"
                    ry="16"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.6"
                >
                    <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="strokeWidth"
                        values="2;6;2"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                </rect>
            )}
        </svg>
    );
}
