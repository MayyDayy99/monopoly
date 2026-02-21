// ============================================================
// DJI MAVIC 3 ENTERPRISE — Állapotalapú animációk
// IDLE:   Lassú propeller, finom lebegés, lassú LED villogás
// MOVING: Gyors propeller (blur), test 15° előredől, gyors LED
// ACTION: LiDAR lézersugár lefelé, pulzáló LED, öröm-pördülés
// ============================================================
import type { TokenComponentProps } from './TokenRegistry';

export function MavicDroneToken({
    size = 28,
    color = '#c7fe1b',
    isAnimating = false,
    label = 'DJI Mavic 3',
    tokenState = 'IDLE',
}: TokenComponentProps) {
    const uid = `mavic-${color.replace('#', '')}`;

    // Állapotfüggő paraméterek — Loricatus SVG Mester & Physics optimalizálás
    const propSpeed = tokenState === 'MOVING' ? '0.05s' : tokenState === 'ACTION' ? '0.07s' : '0.3s';
    const propOpacity = tokenState === 'MOVING' ? 0.6 : 0.25;
    const hoverDur = tokenState === 'MOVING' ? '0.4s' : '2.5s';
    // MOVING: Intenzív jobbra-balra mozgás a haladás szimbolizálására
    const hoverAmount = tokenState === 'MOVING' ? '-10,-6; 10,-4; -10,-6' : '0,0; 0,-3; 0,0';
    const ledDur = tokenState === 'MOVING' ? '0.15s' : tokenState === 'ACTION' ? '0.1s' : '0.8s';
    const tilt = tokenState === 'MOVING' ? 'rotate(18 60 60)' : '';

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
                <linearGradient id={`${uid}-lidar`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Lebegés + opcionális dőlés */}
            <g
                filter={isAnimating ? `url(#${uid}-glow)` : undefined}
                transform={tilt}
            >
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={hoverAmount}
                    dur={hoverDur}
                    repeatCount="indefinite"
                />

                {/* ACTION: Öröm-pördülés + Fluid pulzálás */}
                {tokenState === 'ACTION' && (
                    <>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 60 60; 360 60 60"
                            dur="0.6s"
                            repeatCount="1"
                            additive="sum"
                        />
                        <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="1; 1.15; 1"
                            dur="0.4s"
                            repeatCount="indefinite"
                            additive="sum"
                        />
                    </>
                )}

                {/* Drón váz */}
                <rect x="42" y="52" width="36" height="18" rx="6" ry="6"
                    fill="#374151" stroke="#4b5563" strokeWidth="1" />

                {/* Kamera */}
                <circle cx="60" cy="68" r="4" fill="#1f2937" stroke="#6b7280" strokeWidth="0.8" />
                <circle cx="60" cy="68" r="2" fill="#0ea5e9" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
                </circle>

                {/* Karok */}
                <line x1="42" y1="56" x2="22" y2="40" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="78" y1="56" x2="98" y2="40" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="42" y1="64" x2="22" y2="80" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="78" y1="64" x2="98" y2="80" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />

                {/* Propeller motorok */}
                <circle cx="22" cy="40" r="4" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
                <circle cx="98" cy="40" r="4" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
                <circle cx="22" cy="80" r="4" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
                <circle cx="98" cy="80" r="4" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />

                {/* Propellerek — állapotfüggő sebesség */}
                <ellipse cx="22" cy="40" rx="14" ry="3" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 22 40" to="360 22 40"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="98" cy="40" rx="14" ry="3" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 98 40" to="-360 98 40"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="22" cy="80" rx="14" ry="3" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 22 80" to="-360 22 80"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="98" cy="80" rx="14" ry="3" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 98 80" to="360 98 80"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>

                {/* Státusz LED — állapotfüggő villogás */}
                <circle cx="60" cy="52" r="2" fill={color}>
                    <animate attributeName="opacity" values="1;0.1;1" dur={ledDur} repeatCount="indefinite" />
                </circle>

                {/* ACTION: LiDAR szkennelő lézersugár */}
                {tokenState === 'ACTION' && (
                    <g>
                        <polygon points="55,72 65,72 75,115 45,115"
                            fill={`url(#${uid}-lidar)`} opacity="0.6">
                            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.4s" repeatCount="indefinite" />
                        </polygon>
                        <line x1="45" y1="95" x2="75" y2="95" stroke={color} strokeWidth="1.5" opacity="0.5">
                            <animate attributeName="y1" values="80;110;80" dur="0.8s" repeatCount="indefinite" />
                            <animate attributeName="y2" values="80;110;80" dur="0.8s" repeatCount="indefinite" />
                        </line>
                        {/* Fénypont a földön */}
                        <ellipse cx="60" cy="115" rx="12" ry="3" fill={color} opacity="0.15">
                            <animate attributeName="opacity" values="0.15;0.3;0.15" dur="0.4s" repeatCount="indefinite" />
                        </ellipse>
                    </g>
                )}
            </g>
        </svg>
    );
}
