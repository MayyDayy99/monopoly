import React from 'react';

interface DJIAvataTokenProps {
    size?: number;
    color?: string;
    isAnimating?: boolean;
    label?: string;
    tokenState?: 'IDLE' | 'MOVING' | 'ACTION';
}

/**
 * DJI Avata 2 — Premium FPV Drone Token
 * A Loricatus SVG Mester és Prime Architect standardjai alapján.
 * Fizikai jellemzők: Cinewhoop váz, védett propellerek, neon világítás.
 */
export const DJIAvataToken: React.FC<DJIAvataTokenProps> = ({
    size = 32,
    color = '#c7fe1b',
    isAnimating = false,
    tokenState = 'IDLE'
}) => {
    const isActuallyMoving = tokenState === 'MOVING' || isAnimating;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg
                viewBox="0 0 100 100"
                width={size}
                height={size}
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: `drop-shadow(0 0 5px ${color}44)` }}
            >
                <defs>
                    <linearGradient id="avata_body_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    {/* Propeller animáció */}
                    <style>
                        {`
                        @keyframes prop-spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                        .propeller {
                            transform-origin: center;
                            animation: prop-spin ${isActuallyMoving ? '0.1s' : '0.8s'} linear infinite;
                            opacity: ${isActuallyMoving ? 0.8 : 0.4};
                        }
                        .neon-glow {
                            filter: drop-shadow(0 0 4px ${color});
                        }
                        `}
                    </style>
                </defs>

                {/* Váz (Main Frame - X alakú cinewhoop váz) */}
                <path d="M20 20 L80 80 M80 20 L20 80" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

                {/* Propeller védők (Ducts) */}
                <circle cx="25" cy="25" r="18" fill="none" stroke="#475569" strokeWidth="4" />
                <circle cx="75" cy="25" r="18" fill="none" stroke="#475569" strokeWidth="4" />
                <circle cx="25" cy="75" r="18" fill="none" stroke="#475569" strokeWidth="4" />
                <circle cx="75" cy="75" r="18" fill="none" stroke="#475569" strokeWidth="4" />

                {/* Propellerek (egyszerűsített sziluettek a forgáshoz) */}
                <g className="propeller" style={{ transformOrigin: '25px 25px' }}>
                    <path d="M15 25 L35 25 M25 15 L25 35" stroke={color} strokeWidth="2" opacity="0.6" />
                </g>
                <g className="propeller" style={{ transformOrigin: '75px 25px' }}>
                    <path d="M65 25 L85 25 M75 15 L75 35" stroke={color} strokeWidth="2" opacity="0.6" />
                </g>
                <g className="propeller" style={{ transformOrigin: '25px 75px' }}>
                    <path d="M15 75 L35 75 M25 65 L25 85" stroke={color} strokeWidth="2" opacity="0.6" />
                </g>
                <g className="propeller" style={{ transformOrigin: '75px 75px' }}>
                    <path d="M65 75 L85 75 M75 65 L75 85" stroke={color} strokeWidth="2" opacity="0.6" />
                </g>

                {/* Központi géptest (Fuselage) */}
                <rect x="35" y="30" width="30" height="40" rx="4" fill="url(#avata_body_grad)" stroke="#475569" strokeWidth="2" />

                {/* Kamera optika */}
                <circle cx="50" cy="35" r="5" fill="#000" />
                <circle cx="50" cy="35" r="2" fill="#1e293b" />

                {/* Neon sávok a testen */}
                <rect x="42" y="45" width="16" height="2" fill={color} className="neon-glow" />
                <rect x="42" y="55" width="16" height="2" fill={color} className="neon-glow" />

                {/* Állapotjelző LED-ek a vázon */}
                <circle cx="20" cy="20" r="3" fill={isActuallyMoving ? color : '#475569'} className={isActuallyMoving ? 'neon-glow' : ''} />
                <circle cx="80" cy="20" r="3" fill={isActuallyMoving ? color : '#475569'} className={isActuallyMoving ? 'neon-glow' : ''} />
            </svg>
        </div>
    );
};

export default DJIAvataToken;
