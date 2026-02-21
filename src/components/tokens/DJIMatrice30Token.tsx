// ============================================================
// DJI MATRICE 30T — Állapotalapú animációk
// IDLE:   Összecsukott karok, lassan villogó LED, radar pásztázás
// MOVING: Kinyílt karok, gyors propeller, dőlés
// ACTION: Hőkamera (infravörös) pásztázás, intenzív LED
// ============================================================
import type { TokenComponentProps } from './TokenRegistry';

export function DJIMatrice30Token({
    size = 28,
    color = '#c7fe1b',
    isAnimating = false,
    label = 'DJI Matrice 30T',
    tokenState = 'IDLE',
}: TokenComponentProps) {
    const uid = `m30-${color.replace('#', '')}`;

    const propSpeed = tokenState === 'MOVING' ? '0.06s' : tokenState === 'ACTION' ? '0.08s' : '0.4s';
    const propOpacity = tokenState === 'MOVING' ? 0.5 : 0.2;
    const hoverDur = tokenState === 'MOVING' ? '0.5s' : '3s';
    const hoverAmount = tokenState === 'MOVING' ? '-8,-4; 8,-2; -8,-4' : '0,0; 0,-4; 0,0';
    const ledDur = tokenState === 'MOVING' ? '0.2s' : '1s';
    const tilt = tokenState === 'MOVING' ? 'rotate(12 60 60)' : '';

    return (
        <svg
            viewBox="0 0 120 120"
            width={size}
            height={size}
            role="img"
            aria-label={label}
            style={{ overflow: 'visible' }}
        >
            <defs>
                <filter id={`${uid}-glow`}>
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <radialGradient id={`${uid}-ir`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
            </defs>

            <g filter={isAnimating ? `url(#${uid}-glow)` : undefined} transform={tilt}>
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={hoverAmount}
                    dur={hoverDur}
                    repeatCount="indefinite"
                />

                {/* Karok - Kompaktabb M30 stílus */}
                <g stroke="#4b5563" strokeWidth="3" strokeLinecap="round">
                    <line x1="45" y1="50" x2="25" y2="35" />
                    <line x1="75" y1="50" x2="95" y2="35" />
                    <line x1="45" y1="70" x2="25" y2="85" />
                    <line x1="75" y1="70" x2="95" y2="85" />
                </g>

                {/* Test */}
                <rect x="42" y="48" width="36" height="24" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="1" />
                <rect x="48" y="44" width="24" height="6" rx="2" fill="#374151" />

                {/* Motorok */}
                <circle cx="25" cy="35" r="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <circle cx="95" cy="35" r="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <circle cx="25" cy="85" r="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
                <circle cx="95" cy="85" r="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />

                {/* Propellerek */}
                <g opacity={propOpacity} fill={color}>
                    <ellipse cx="25" cy="35" rx="12" ry="2.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 35" to="360 25 35" dur={propSpeed} repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="95" cy="35" rx="12" ry="2.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 95 35" to="-360 95 35" dur={propSpeed} repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="25" cy="85" rx="12" ry="2.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 85" to="-360 25 85" dur={propSpeed} repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="95" cy="85" rx="12" ry="2.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 95 85" to="360 95 85" dur={propSpeed} repeatCount="indefinite" />
                    </ellipse>
                </g>

                {/* Státusz LED */}
                <circle cx="60" cy="50" r="1.5" fill={color}>
                    <animate attributeName="opacity" values="1;0.2;1" dur={ledDur} repeatCount="indefinite" />
                </circle>

                {/* Hőkamera (ACTION állapotban) */}
                {tokenState === 'ACTION' && (
                    <g>
                        <circle cx="60" cy="65" r="15" fill={`url(#${uid}-ir)`}>
                            <animate attributeName="r" values="10;20;10" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="60" cy="65" r="2" fill="#ef4444" />
                    </g>
                )}
            </g>
        </svg>
    );
}
