// ============================================================
// LEICA RTC360 — Állapotalapú animációk
// IDLE:   Áll a tripodon, szkenner fej lassan forog, lassú LED
// MOVING: Összecsukódik, lebeg/ugrál (szállításban van)
// ACTION: Fej gyorsan forog, lézer intenzív, szkennelés fénykúp
// ============================================================
import type { TokenComponentProps } from './TokenRegistry';

export function LeicaScannerToken({
    size = 28,
    color = '#c7fe1b',
    isAnimating = false,
    label = 'Leica RTC360',
    tokenState = 'IDLE',
}: TokenComponentProps) {
    const uid = `leica-${color.replace('#', '')}`;

    const headSpeed = tokenState === 'ACTION' ? '0.4s' : tokenState === 'MOVING' ? '6s' : '4s';
    const ledDur = tokenState === 'ACTION' ? '0.1s' : tokenState === 'MOVING' ? '0.3s' : '1s';
    const isCollapsed = tokenState === 'MOVING';

    return (
        <svg
            viewBox="0 0 120 130"
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
                <linearGradient id={`${uid}-scan`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${uid}-action-scan`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            <g filter={isAnimating ? `url(#${uid}-glow)` : undefined}>
                {/* MOVING: bounce animáció */}
                {isCollapsed && (
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="-10,0; 10,-8; -10,0"
                        dur="0.4s"
                        repeatCount="indefinite"
                    />
                )}

                {/* ── Tripod lábak — MOVING-ban összecsukva ── */}
                {!isCollapsed ? (
                    <>
                        <line x1="60" y1="80" x2="25" y2="125" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="60" y1="80" x2="95" y2="125" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="60" y1="80" x2="60" y2="128" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="25" cy="125" r="2.5" fill="#4b5563" />
                        <circle cx="95" cy="125" r="2.5" fill="#4b5563" />
                        <circle cx="60" cy="128" r="2.5" fill="#4b5563" />
                    </>
                ) : (
                    <>
                        {/* Összecsukott lábak — párhuzamosan lefelé */}
                        <line x1="55" y1="80" x2="55" y2="120" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="60" y1="80" x2="60" y2="120" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="65" y1="80" x2="65" y2="120" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                )}

                {/* Hub */}
                <circle cx="60" cy="80" r="6" fill="#374151" stroke="#4b5563" strokeWidth="1" />

                {/* ── Szkenner fej — forgás ── */}
                <g>
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 60 55"
                        to="360 60 55"
                        dur={headSpeed}
                        repeatCount="indefinite"
                    />

                    <circle cx="60" cy="55" r="18" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
                    <circle cx="60" cy="55" r="12" fill="none" stroke="#4b5563" strokeWidth="0.8" />

                    {/* Lencse */}
                    <circle cx="60" cy="42" r="4" fill="#0f172a"
                        stroke={tokenState === 'ACTION' ? color : '#0ea5e9'} strokeWidth="1">
                        <animate attributeName="fill"
                            values={tokenState === 'ACTION'
                                ? `#0f172a;${color};#0f172a`
                                : '#0f172a;#0ea5e9;#0f172a'}
                            dur={tokenState === 'ACTION' ? '0.3s' : '0.8s'}
                            repeatCount="indefinite" />
                    </circle>

                    {/* Lézer kibocsátó */}
                    <line x1="60" y1="38" x2="60" y2="15"
                        stroke={tokenState === 'ACTION' ? color : '#0ea5e9'}
                        strokeWidth={tokenState === 'ACTION' ? 2.5 : 1.5}
                        opacity="0.6" strokeLinecap="round"
                    >
                        <animate attributeName="opacity"
                            values={tokenState === 'ACTION' ? '0.8;0.3;0.8' : '0.6;0.1;0.6'}
                            dur={tokenState === 'ACTION' ? '0.2s' : '0.4s'}
                            repeatCount="indefinite" />
                    </line>

                    <rect x="50" y="64" width="20" height="5" rx="2" fill="#374151" />
                </g>

                {/* ACTION: Fluid pulzálás */}
                {tokenState === 'ACTION' && (
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1; 1.08; 1"
                        dur="0.5s"
                        repeatCount="indefinite"
                        additive="sum"
                    />
                )}
                {tokenState === 'ACTION' && (
                    <g>
                        <circle cx="60" cy="55" r="40" fill="none" stroke={color} strokeWidth="0.8" opacity="0.2"
                            strokeDasharray="4 4">
                            <animateTransform attributeName="transform" type="rotate"
                                from="0 60 55" to="360 60 55" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="60" cy="55" r="30" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15"
                            strokeDasharray="3 5">
                            <animateTransform attributeName="transform" type="rotate"
                                from="360 60 55" to="0 60 55" dur="0.8s" repeatCount="indefinite" />
                        </circle>
                    </g>
                )}

                {/* Nyak */}
                <rect x="56" y="72" width="8" height="10" rx="2" fill="#4b5563" />

                {/* Státusz LED */}
                <circle cx="60" cy="76" r="1.5" fill={color}>
                    <animate attributeName="opacity" values="1;0.3;1" dur={ledDur} repeatCount="indefinite" />
                </circle>
            </g>
        </svg>
    );
}
