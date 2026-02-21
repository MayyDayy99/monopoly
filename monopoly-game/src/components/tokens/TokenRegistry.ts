// ============================================================
// TOKEN REGISTRY — Központi token térkép
// A játékos által választható bábuk és azok React komponensei.
// Jelenleg placeholder-ek, a végleges SVG-k ide kerülnek be.
// ============================================================
import type { ComponentType } from 'react';
import { PlaceholderToken } from './PlaceholderToken';

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
}

/** Regisztrált token definíció */
export interface TokenDefinition {
    /** Egyedi token ID */
    id: string;
    /** Megjelenítendő név */
    name: string;
    /** Emoji (visszafelé kompatibilitáshoz, pl. event log) */
    emoji: string;
    /** A React SVG komponens */
    component: ComponentType<TokenComponentProps>;
}

/**
 * Az elérhető bábuk regisztere.
 * A végleges fázisban ide kerülnek a DroneToken, ScannerToken, RobotDogToken.
 * Jelenleg mind PlaceholderToken-t használ, különböző alapszínekkel.
 */
export const TOKEN_REGISTRY: TokenDefinition[] = [
    {
        id: 'drone',
        name: 'Drón',
        emoji: '🛸',
        component: PlaceholderToken, // TODO: DroneToken SVG (pörgő propeller)
    },
    {
        id: 'scanner',
        name: '3D Szkenner',
        emoji: '📡',
        component: PlaceholderToken, // TODO: ScannerToken SVG (pásztázó lézer)
    },
    {
        id: 'robotdog',
        name: 'Robotkutya',
        emoji: '🐕',
        component: PlaceholderToken, // TODO: RobotDogToken SVG (villogó LED)
    },
    {
        id: 'theodolite',
        name: 'Teodolit',
        emoji: '🔭',
        component: PlaceholderToken, // TODO: TheodoliteToken SVG
    },
];

/**
 * Token ID alapján visszaadja a token definíciót.
 * Ha nincs ilyen ID, visszaadja az elsőt (fallback).
 */
export function getTokenById(id: string): TokenDefinition {
    return TOKEN_REGISTRY.find(t => t.id === id) || TOKEN_REGISTRY[0];
}

/**
 * Régi emoji string alapján visszaadja a legjobb illeszkedést.
 * Visszafelé kompatibilitáshoz (meglévő mentett játékok).
 */
export function getTokenByEmoji(emoji: string): TokenDefinition {
    return TOKEN_REGISTRY.find(t => t.emoji === emoji) || TOKEN_REGISTRY[0];
}
