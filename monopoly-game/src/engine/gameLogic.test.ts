import { describe, it, expect } from 'vitest';
import { calculateRent, calculateNetWorth } from './gameLogic';
import { createInitialState } from './gameReducer';
import { BOARD_SPACES } from '../data/board';
import type { GameState } from '../types';

describe('Monopoly Game Logic', () => {
    it('should double rent for unmortgaged monopoly', () => {
        const state = createInitialState();
        const playerId = 'p1';

        // Give player all properties in brown group (1, 3)
        const newState: GameState = {
            ...state,
            players: [{ ...state.players[0], id: playerId, properties: [1, 3] }],
            ownedProperties: {
                1: { spaceId: 1, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
                3: { spaceId: 3, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
            }
        };

        const space1 = BOARD_SPACES[1];
        const rent = calculateRent(newState, space1, 7);

        // Brown base rent is 2, double is 4
        expect(rent).toBe(4);
    });

    it('should NOT double rent if a property in the group is mortgaged', () => {
        const state = createInitialState();
        const playerId = 'p1';

        const newState: GameState = {
            ...state,
            players: [{ ...state.players[0], id: playerId, properties: [1, 3] }],
            ownedProperties: {
                1: { spaceId: 1, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
                3: { spaceId: 3, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: true },
            }
        };

        const space1 = BOARD_SPACES[1];
        const rent = calculateRent(newState, space1, 7);

        // Should be base rent (2), not double
        expect(rent).toBe(2);
    });

    it('should calculate railroad rent correctly', () => {
        const state = createInitialState();
        const playerId = 'p1';

        // 5, 15, 25, 35 are railroads
        const newState: GameState = {
            ...state,
            players: [{ ...state.players[0], id: playerId, properties: [5, 15, 25] }],
            ownedProperties: {
                5: { spaceId: 5, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
                15: { spaceId: 15, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
                25: { spaceId: 25, ownerId: playerId, houses: 0, hasHotel: false, isMortgaged: false },
            }
        };

        const railroad5 = BOARD_SPACES[5];
        // 3 railroads owned: 25 * 2^(3-1) = 25 * 4 = 100
        expect(calculateRent(newState, railroad5, 7)).toBe(100);
    });

    it('should calculate net worth correctly', () => {
        const state = createInitialState();
        const playerId = 'p1';
        const newState: GameState = {
            ...state,
            players: [{ ...state.players[0], id: playerId, money: 1000, properties: [] }],
        };

        // Net worth with 1000 money and no properties should be 1000
        expect(calculateNetWorth(newState, playerId)).toBe(1000);
    });
});
