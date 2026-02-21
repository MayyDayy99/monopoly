// ============================================================
// DJI MATRICE 350 RTK — Állapotalapú animációk
// IDLE:   Lassú propeller, lassú lebegés, alternáló RTK LED
// MOVING: Gyors propeller, előredőlés, gyors LiDAR pásztázás
// ACTION: LiDAR intenzív lefelé sugár, RTK LED gyors flash, pördülés
// ============================================================
import type { TokenComponentProps } from './TokenRegistry';

export function MatriceDroneToken({
    size = 28,
    color = '#c7fe1b',
    isAnimating = false,
    label = 'DJI Matrice 350 RTK',
    tokenState = 'IDLE',
}: TokenComponentProps) {
    const uid = `matrice-${color.replace('#', '')}`;

    const propSpeed = tokenState === 'MOVING' ? '0.05s' : tokenState === 'ACTION' ? '0.07s' : '0.25s';
    const propOpacity = tokenState === 'MOVING' ? 0.6 : 0.3;
    const hoverDur = tokenState === 'MOVING' ? '0.35s' : '2.5s';
    // MOVING: Komolyabb horizontális kilengés a progresszió érzékeltetéséhez
    const hoverValues = tokenState === 'MOVING' ? '-12,-5; 12,-3; -12,-5' : '0,0; 0,-2; 0,0';
    const ledDur = tokenState === 'ACTION' ? '0.1s' : tokenState === 'MOVING' ? '0.3s' : '1.2s';
    const tilt = tokenState === 'MOVING' ? 'rotate(15 65 53)' : '';
    const lidarOpacity = tokenState === 'ACTION' ? 0.7 : tokenState === 'MOVING' ? 0.4 : 0.15;
    const lidarSweepDur = tokenState === 'ACTION' ? '0.5s' : '2s';

    return (
        <svg
            viewBox="0 0 130 130"
            width={size}
            height={size}
            role="img"
            aria-label={label}
            style={{ overflow: 'visible' }}
        >
            <defs>
                <filter id={`${uid}-glow`}>
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id={`${uid}-beam`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${uid}-action-beam`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            <g filter={isAnimating ? `url(#${uid}-glow)` : undefined} transform={tilt}>
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={hoverValues}
                    dur={hoverDur}
                    repeatCount="indefinite"
                />

                {/* ACTION: Öröm-pördülés + Fluid pulzálás */}
                {tokenState === 'ACTION' && (
                    <>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 65 53; 360 65 53"
                            dur="0.7s"
                            repeatCount="1"
                            additive="sum"
                        />
                        <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="1; 1.12; 1"
                            dur="0.35s"
                            repeatCount="indefinite"
                            additive="sum"
                        />
                    </>
                )}

                {/* Fő test */}
                <rect x="35" y="40" width="60" height="28" rx="8" ry="8"
                    fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
                <rect x="45" y="38" width="40" height="6" rx="3"
                    fill="#374151" stroke="#4b5563" strokeWidth="0.5" />

                {/* RTK antennák */}
                <line x1="50" y1="38" x2="50" y2="28" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="26" r="3" fill="#4b5563" stroke="#6b7280" strokeWidth="0.5" />
                <circle cx="50" cy="26" r="1.5" fill={color} opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur={ledDur} repeatCount="indefinite" />
                </circle>

                <line x1="80" y1="38" x2="80" y2="28" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="80" cy="26" r="3" fill="#4b5563" stroke="#6b7280" strokeWidth="0.5" />
                <circle cx="80" cy="26" r="1.5" fill={color} opacity="0.8">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur={ledDur} repeatCount="indefinite" />
                </circle>

                {/* LiDAR modul */}
                <rect x="55" y="68" width="20" height="8" rx="3" ry="3"
                    fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" />
                <circle cx="65" cy="72" r="2.5" fill="#0ea5e9" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="0.5s" repeatCount="indefinite" />
                </circle>

                {/* LiDAR sugár — ACTION: neon zöld, egyébként kék */}
                <polygon
                    points="58,76 72,76 80,120 50,120"
                    fill={tokenState === 'ACTION' ? `url(#${uid}-action-beam)` : `url(#${uid}-beam)`}
                    opacity={lidarOpacity}
                >
                    <animate attributeName="opacity"
                        values={`${lidarOpacity};${lidarOpacity * 0.4};${lidarOpacity}`}
                        dur="0.8s" repeatCount="indefinite" />
                </polygon>
                <line x1="50" y1="95" x2="80" y2="95"
                    stroke={tokenState === 'ACTION' ? color : '#38bdf8'}
                    strokeWidth="1.5" opacity="0.5"
                >
                    <animate attributeName="y1" values="80;115;80" dur={lidarSweepDur} repeatCount="indefinite" />
                    <animate attributeName="y2" values="80;115;80" dur={lidarSweepDur} repeatCount="indefinite" />
                </line>

                {/* Karok */}
                <line x1="35" y1="46" x2="12" y2="30" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="95" y1="46" x2="118" y2="30" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="35" y1="60" x2="12" y2="76" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="95" y1="60" x2="118" y2="76" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />

                {/* Motorok */}
                <circle cx="12" cy="30" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
                <circle cx="118" cy="30" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
                <circle cx="12" cy="76" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
                <circle cx="118" cy="76" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />

                {/* Propellerek */}
                <ellipse cx="12" cy="30" rx="16" ry="3.5" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 12 30" to="360 12 30"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="118" cy="30" rx="16" ry="3.5" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 118 30" to="-360 118 30"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="12" cy="76" rx="16" ry="3.5" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 12 76" to="-360 12 76"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="118" cy="76" rx="16" ry="3.5" fill={color} opacity={propOpacity}>
                    <animateTransform attributeName="transform" type="rotate" from="0 118 76" to="360 118 76"
                        dur={propSpeed} repeatCount="indefinite" />
                </ellipse>

                {/* Státusz LED */}
                <circle cx="65" cy="40" r="1.5" fill={color}>
                    <animate attributeName="opacity" values="1;0.1;1" dur={ledDur} repeatCount="indefinite" />
                </circle>

                {/* ACTION: fénypont a földön */}
                {tokenState === 'ACTION' && (
                    <ellipse cx="65" cy="122" rx="14" ry="3" fill={color} opacity="0.2">
                        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="0.4s" repeatCount="indefinite" />
                    </ellipse>
                )}
            </g>
        </svg>
    );
}
