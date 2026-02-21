// ============================================================
// GAME LOGIC UTILITIES
// ============================================================
import type { BoardSpace, DiceResult, GameState, OwnedProperty, Player } from '../types';
import { BOARD_SPACES, COLOR_GROUPS, RAILROAD_IDS, UTILITY_IDS } from '../data/board';

// ---- Dice ----
export function rollDice(): DiceResult {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    return { die1, die2, isDouble: die1 === die2, total: die1 + die2 };
}

// ---- Movement ----
export function movePlayer(player: Player, steps: number): { newPosition: number; passedGo: boolean } {
    const newPosition = (player.position + steps) % 40;
    const passedGo = player.position + steps >= 40;
    return { newPosition, passedGo };
}

export function movePlayerTo(player: Player, position: number): { passedGo: boolean } {
    const passedGo = position < player.position && position !== 10; // going to jail doesn't pass GO
    return { passedGo };
}

// ---- Ownership ----
export function getSpaceOwner(state: GameState, spaceId: number): Player | null {
    const owned = state.ownedProperties[spaceId];
    if (!owned) return null;
    return state.players.find(p => p.id === owned.ownerId) || null;
}

export function getPlayerProperties(state: GameState, playerId: string): OwnedProperty[] {
    return Object.values(state.ownedProperties).filter(op => op.ownerId === playerId);
}

// ---- Monopoly Check ----
// #70: A color group counts as monopoly if one player OWNS all properties,
// even if some are mortgaged. Unmortgaged properties in the group still get double rent.
export function hasMonopoly(state: GameState, playerId: string, colorGroup: string): boolean {
    const groupSpaces = COLOR_GROUPS[colorGroup];
    if (!groupSpaces) return false;
    return groupSpaces.every(sid => {
        const owned = state.ownedProperties[sid];
        return owned && owned.ownerId === playerId; // ownership check only, not mortgage
    });
}

// Strict check: all owned AND none mortgaged (for building eligibility)
export function hasUnmortgagedMonopoly(state: GameState, playerId: string, colorGroup: string): boolean {
    const groupSpaces = COLOR_GROUPS[colorGroup];
    if (!groupSpaces) return false;
    return groupSpaces.every(sid => {
        const owned = state.ownedProperties[sid];
        return owned && owned.ownerId === playerId && !owned.isMortgaged;
    });
}

// ---- Rent Calculation ----
export function calculateRent(
    state: GameState,
    space: BoardSpace,
    diceTotal: number
): number {
    const owned = state.ownedProperties[space.id];
    if (!owned || owned.isMortgaged) return 0;

    // #96: No rent if owner is in jail
    const owner = state.players.find(p => p.id === owned.ownerId);
    if (state.houseRules?.noRentInJail && owner?.inJail) return 0;

    // Property
    if (space.type === 'property' && space.property) {
        const prop = space.property;
        if (owned.hasHotel) return prop.rentHotel;
        if (owned.houses === 4) return prop.rent4H;
        if (owned.houses === 3) return prop.rent3H;
        if (owned.houses === 2) return prop.rent2H;
        if (owned.houses === 1) return prop.rent1H;
        // No houses — check for monopoly (double rent)
        if (hasUnmortgagedMonopoly(state, owned.ownerId, prop.colorGroup)) {
            return prop.rentBase * 2;
        }
        return prop.rentBase;
    }

    // Railroad
    if (space.type === 'railroad') {
        const ownedRailroads = RAILROAD_IDS.filter(rid => {
            const o = state.ownedProperties[rid];
            return o && o.ownerId === owned.ownerId && !o.isMortgaged;
        }).length;
        return 25 * Math.pow(2, ownedRailroads - 1); // 25, 50, 100, 200
    }

    // Utility
    if (space.type === 'utility') {
        const ownedUtilities = UTILITY_IDS.filter(uid => {
            const o = state.ownedProperties[uid];
            return o && o.ownerId === owned.ownerId && !o.isMortgaged;
        }).length;
        return ownedUtilities >= 2 ? diceTotal * 10 : diceTotal * 4;
    }

    return 0;
}

// ---- Building Checks ----
export function canBuildHouse(state: GameState, playerId: string, spaceId: number): boolean {
    const space = BOARD_SPACES[spaceId];
    if (!space || space.type !== 'property' || !space.property) return false;

    const owned = state.ownedProperties[spaceId];
    if (!owned || owned.ownerId !== playerId || owned.isMortgaged) return false;
    if (owned.hasHotel || owned.houses >= 4) return false;
    if (state.houses_available <= 0) return false;

    const colorGroup = space.property.colorGroup;
    // Must have unmortgaged monopoly to build
    if (!hasUnmortgagedMonopoly(state, playerId, colorGroup)) return false;

    // Even-build rule: can't build more than 1 ahead of lowest in group
    const groupSpaces = COLOR_GROUPS[colorGroup];
    const minHouses = Math.min(...groupSpaces.map(sid => {
        const o = state.ownedProperties[sid];
        return o ? (o.hasHotel ? 5 : o.houses) : 0;
    }));
    const currentHouses = owned.houses;
    if (currentHouses > minHouses) return false;

    // Check money
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.money < space.property.houseCost) return false;

    return true;
}

// ---- Sell House Check (#23 — even-selling rule) ----
export function canSellHouse(state: GameState, playerId: string, spaceId: number): boolean {
    const space = BOARD_SPACES[spaceId];
    if (!space || space.type !== 'property' || !space.property) return false;

    const owned = state.ownedProperties[spaceId];
    if (!owned || owned.ownerId !== playerId) return false;
    if (owned.houses <= 0 && !owned.hasHotel) return false;

    // Even-sell rule: can't sell if this property has fewer houses than another in the group
    const colorGroup = space.property.colorGroup;
    const groupSpaces = COLOR_GROUPS[colorGroup];
    const currentLevel = owned.hasHotel ? 5 : owned.houses;
    const maxInGroup = Math.max(...groupSpaces.map(sid => {
        const o = state.ownedProperties[sid];
        return o ? (o.hasHotel ? 5 : o.houses) : 0;
    }));
    if (currentLevel < maxInGroup) return false;

    // Hotel sell: need 4 available houses (to downgrade), unless no houses available → sell to empty  (#69)
    if (owned.hasHotel && state.houses_available < 4) {
        // Can only sell hotel straight to 0 houses if not enough houses in bank
        return true; // allowed but results in 0 houses (major loss)
    }

    return true;
}

export function canBuildHotel(state: GameState, playerId: string, spaceId: number): boolean {
    const space = BOARD_SPACES[spaceId];
    if (!space || space.type !== 'property' || !space.property) return false;

    const owned = state.ownedProperties[spaceId];
    if (!owned || owned.ownerId !== playerId || owned.isMortgaged) return false;
    if (owned.houses !== 4 || owned.hasHotel) return false;
    if (state.hotels_available <= 0) return false;

    const colorGroup = space.property.colorGroup;
    if (!hasMonopoly(state, playerId, colorGroup)) return false;

    // All other properties must have 4 houses or hotel
    const groupSpaces = COLOR_GROUPS[colorGroup];
    const allReady = groupSpaces.every(sid => {
        const o = state.ownedProperties[sid];
        return o && (o.houses === 4 || o.hasHotel);
    });
    if (!allReady) return false;

    const player = state.players.find(p => p.id === playerId);
    if (!player || player.money < space.property.houseCost) return false;

    return true;
}

// ---- Nearest Railroad / Utility ----
export function nearestRailroad(position: number): number {
    for (const rid of RAILROAD_IDS) {
        if (rid > position) return rid;
    }
    return RAILROAD_IDS[0]; // wrap around
}

export function nearestUtility(position: number): number {
    for (const uid of UTILITY_IDS) {
        if (uid > position) return uid;
    }
    return UTILITY_IDS[0]; // wrap around
}

// ---- Repair Costs ----
export function calculateRepairs(state: GameState, playerId: string, perHouse: number, perHotel: number): number {
    let totalHouses = 0;
    let totalHotels = 0;
    Object.values(state.ownedProperties)
        .filter(op => op.ownerId === playerId)
        .forEach(op => {
            if (op.hasHotel) totalHotels++;
            else totalHouses += op.houses;
        });
    return totalHouses * perHouse + totalHotels * perHotel;
}

// ---- ID Generator ----
let logIdCounter = 0;
export function generateLogId(): string {
    return `log_${Date.now()}_${logIdCounter++}`;
}

export function calculateNetWorth(state: GameState, playerId: string): number {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return 0;

    let netWorth = player.money;
    player.properties.forEach(sid => {
        const space = BOARD_SPACES[sid];
        const owned = state.ownedProperties[sid];
        if (owned?.isMortgaged) {
            netWorth += space?.property?.mortgageValue || space?.railroad?.mortgageValue || space?.utility?.mortgageValue || 0;
        } else {
            netWorth += space?.property?.price || space?.railroad?.price || space?.utility?.price || 0;
        }
        if (owned) {
            netWorth += owned.houses * (space?.property?.houseCost || 0);
            if (owned.hasHotel) netWorth += (space?.property?.houseCost || 0);
        }
    });

    return netWorth;
}

/**
 * #18: Check if player has any assets they can liquidize (mortgage or sell buildings)
 */
export function canRaiseFunds(state: GameState, playerId: string): boolean {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return false;

    // Check if can mortgage anything
    const hasMortgageable = player.properties.some(sid => {
        const owned = state.ownedProperties[sid];
        // Can only mortgage if NOT mortgaged AND NO buildings on color group
        if (!owned || owned.isMortgaged) return false;

        const space = BOARD_SPACES[sid];
        if (space.property) {
            const groupSpaces = COLOR_GROUPS[space.property.colorGroup];
            const hasBuildingsInGroup = groupSpaces.some(gsid => {
                const o = state.ownedProperties[gsid];
                return o && (o.houses > 0 || o.hasHotel);
            });
            return !hasBuildingsInGroup;
        }
        return true; // Railroads/Utilities always mortgageable if not mortgaged
    });

    if (hasMortgageable) return true;

    // Check if can sell any building
    const hasBuildings = player.properties.some(sid => {
        const owned = state.ownedProperties[sid];
        return owned && (owned.houses > 0 || owned.hasHotel);
    });

    return hasBuildings;
}
