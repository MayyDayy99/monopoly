// A 4 Loricatus készülék: Mavic 3, Matrice 350, Leica RTC360, Avata 2
// ============================================================
import type { ComponentType } from 'react';
import type { TokenAnimState } from '../../types';
import { MavicDroneToken } from './MavicDroneToken';
import { MatriceDroneToken } from './MatriceDroneToken';
import { DJIMatrice30Token } from './DJIMatrice30Token';
import { DJIAvataToken } from './DJIAvataToken';

/** Egységes prop interfész minden token komponenshez */
export interface TokenComponentProps {
    /** A bábu mérete pixelben */
    size?: number;
    /** A bábu színe (játékos szín) */
    color?: string;
    /** Aktív animáció állapot */
    isAnimating?: boolean;
    /** Játékos neve tooltip-hez */
    label?: string;
    /** Állapotalapú animáció: IDLE / MOVING / ACTION */
    tokenState?: TokenAnimState;
}

/** Regisztrált token definíció */
export interface TokenDefinition {
    /** Egyedi token ID */
    id: string;
    /** Megjelenítendő név */
    name: string;
    /** Emoji (event log + fallback) */
    emoji: string;
    /** A React SVG komponens */
    component: ComponentType<TokenComponentProps>;
}

/**
 * A 4 Loricatus készülék regisztere.
 * Minden token egy optimalizált SVG komponens beépített SMIL animációkkal.
 */
export const TOKEN_REGISTRY: TokenDefinition[] = [
    {
        id: 'mavic',
        name: 'DJI Mavic 3',
        emoji: '🛸',
        component: MavicDroneToken,
    },
    {
        id: 'matrice',
        name: 'DJI Matrice 350 RTK',
        emoji: '📡',
        component: MatriceDroneToken,
    },
    {
        id: 'm30',
        name: 'DJI Matrice 30T',
        emoji: '🔭',
        component: DJIMatrice30Token,
    },
    {
        id: 'avata',
        name: 'DJI Avata 2',
        emoji: '🎮',
        component: DJIAvataToken,
    },
];

/**
 * Token ID alapján visszaadja a token definíciót.
 */
export function getTokenById(id: string): TokenDefinition {
    return TOKEN_REGISTRY.find(t => t.id === id) || TOKEN_REGISTRY[0];
}

/**
 * Régi emoji string alapján visszaadja a legjobb illeszkedést.
 */
export function getTokenByEmoji(emoji: string): TokenDefinition {
    return TOKEN_REGISTRY.find(t => t.emoji === emoji) || TOKEN_REGISTRY[0];
}
