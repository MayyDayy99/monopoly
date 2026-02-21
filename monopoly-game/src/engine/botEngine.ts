// ============================================================
// AI BOT ENGINE — Simple bot logic (#73-76)
// Decides actions automatically for bot players.
// ============================================================
import type { GameState, GameAction } from '../types';
import { BOARD_SPACES } from '../data/board';
import { canBuildHouse, canBuildHotel } from './gameLogic';

/**
 * Returns the next action for a bot player, or null if no action needed.
 * Call this after every state change when the current player isBot.
 */
export function getBotAction(state: GameState): GameAction | null {
    // Determine the acting player based on phase
    let activePlayerId: string | null = null;

    if (state.phase === 'auction' && state.auction) {
        activePlayerId = state.auction.activeBidders[state.auction.currentBidderIndex];
    } else if (state.phase === 'trading' && state.tradeOffer) {
        activePlayerId = state.tradeOffer.toPlayerId;
    } else {
        const cp = state.players[state.currentPlayerIndex];
        activePlayerId = cp ? cp.id : null;
    }

    const activePlayer = state.players.find(p => p.id === activePlayerId);
    if (!activePlayer || !activePlayer.isBot || activePlayer.isBankrupt) return null;

    switch (state.phase) {
        case 'rolling':
            if (activePlayer.inJail) {
                // #75: Jail strategy — pay fine if have money, otherwise try doubles
                if (activePlayer.hasGetOutOfJailCard > 0) {
                    return { type: 'USE_JAIL_CARD' };
                }
                if (activePlayer.money >= 300) {
                    return { type: 'PAY_JAIL_FINE' };
                }
                return { type: 'TRY_JAIL_DOUBLES' };
            }
            return { type: 'ROLL_DICE' };

        case 'landed': {
            const space = BOARD_SPACES[activePlayer.position];
            const isOwnable = ['property', 'railroad', 'utility'].includes(space.type);
            const isUnowned = isOwnable && !state.ownedProperties[space.id];

            if (isUnowned) {
                const price = space.property?.price || space.railroad?.price || space.utility?.price || 0;
                // #74: Simple strategy — buy if can afford and keep 100k reserve
                if (activePlayer.money >= price + 100) {
                    return { type: 'BUY_PROPERTY' };
                } else {
                    return { type: 'DECLINE_PROPERTY' };
                }
            }
            // Nothing to do, end turn
            return { type: 'END_TURN' };
        }

        case 'card-drawn':
            return { type: 'RESOLVE_CARD' };

        case 'turn-end': {
            // #18: Bot Debt settlement logic
            if (activePlayer.money < 0) {
                // 1. Sell any house/hotel
                for (const sid of activePlayer.properties) {
                    const owned = state.ownedProperties[sid];
                    if (owned && (owned.houses > 0 || owned.hasHotel)) {
                        const space = BOARD_SPACES[sid];
                        if (space.property) {
                            return { type: 'SELL_HOUSE', spaceId: sid };
                        }
                    }
                }

                // 2. Mortgage anything
                for (const sid of activePlayer.properties) {
                    const owned = state.ownedProperties[sid];
                    if (owned && !owned.isMortgaged) {
                        const space = BOARD_SPACES[sid];
                        if (space.property) {
                            const groupSpaces = Object.values(BOARD_SPACES).filter(s => s.property?.colorGroup === space.property?.colorGroup).map(s => s.id);
                            const hasBuildings = groupSpaces.some(gsid => {
                                const o = state.ownedProperties[gsid];
                                return o && (o.houses > 0 || o.hasHotel);
                            });
                            if (!hasBuildings) return { type: 'MORTGAGE_PROPERTY', spaceId: sid };
                        } else {
                            return { type: 'MORTGAGE_PROPERTY', spaceId: sid };
                        }
                    }
                }

                // 3. No more assets -> Bankrupt
                return { type: 'DECLARE_BANKRUPTCY' };
            }

            // #76: Building strategy — try to build on monopolies
            const buildAction = tryBotBuild(state, activePlayer.id);
            if (buildAction) return buildAction;

            return { type: 'END_TURN' };
        }

        case 'auction': {
            // #75: Auction strategy — bid up to 75% of property value
            if (!state.auction) return null;
            const auction = state.auction;
            // No need to check player ID again, we already confirmed activePlayer is bot matches auction current bidder

            const space = BOARD_SPACES[auction.spaceId];
            const basePrice = space.property?.price || space.railroad?.price || space.utility?.price || 200;
            const maxBid = Math.min(
                Math.floor(basePrice * 0.85), // Bots a bit more aggressive in auctions
                activePlayer.money - 30
            );

            if (auction.currentBid < maxBid && maxBid > 10) {
                const bidAmount = Math.min(auction.currentBid + 10, maxBid);
                return { type: 'AUCTION_BID', amount: bidAmount };
            }
            return { type: 'AUCTION_PASS' };
        }

        case 'trading': {
            // Bot always rejects trade offers
            const offer = state.tradeOffer;
            if (offer && offer.toPlayerId === activePlayer.id) {
                return { type: 'REJECT_TRADE' };
            }
            return null;
        }

        default:
            return null;
    }
}

function tryBotBuild(state: GameState, playerId: string): GameAction | null {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.money < 200) return null;

    // Find properties where we can build
    for (const sid of player.properties) {
        const space = BOARD_SPACES[sid];
        if (!space.property) continue;

        // Try hotel first
        if (canBuildHotel(state, playerId, sid)) {
            return { type: 'BUILD_HOTEL', spaceId: sid };
        }

        // Try house
        if (canBuildHouse(state, playerId, sid)) {
            const houseCost = space.property.houseCost;
            if (player.money >= houseCost + 150) {
                return { type: 'BUILD_HOUSE', spaceId: sid };
            }
        }
    }

    return null;
}

/**
 * Delay in ms before a bot action is executed.
 * Makes the game feel more natural.
 */
export const BOT_DELAY = 800;
