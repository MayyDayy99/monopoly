// ============================================================
// GAME REDUCER — Core State Machine
// ============================================================
import type { GameState, GameAction, Player, LogEntry, AuctionState, HouseRules, OwnedProperty } from '../types';
import { BOARD_SPACES, STARTING_MONEY, GO_SALARY, JAIL_FINE, MAX_HOUSES, MAX_HOTELS } from '../data/board';
import { CHANCE_CARDS, COMMUNITY_CARDS, shuffleDeck } from '../data/cards';
import {
    rollDice, calculateRent, canBuildHouse, canBuildHotel,
    canSellHouse, nearestRailroad, nearestUtility, calculateRepairs, generateLogId,
    calculateNetWorth,
} from './gameLogic';

function addLog(state: GameState, playerId: string, message: string, type: LogEntry['type']): GameState {
    const entry: LogEntry = {
        id: generateLogId(),
        timestamp: Date.now(),
        playerId,
        message,
        type,
    };
    return { ...state, logs: [...state.logs, entry] };
}

export const DEFAULT_HOUSE_RULES: HouseRules = {
    freeParking_jackpot: false,
    doubleOnGo: false,
    incomeTax_percentage: false,
    noRentInJail: false,
    speedMode: false,
    colorblindMode: false,
};

export function createInitialState(): GameState {
    return {
        phase: 'setup',
        players: [],
        currentPlayerIndex: 0,
        ownedProperties: {},
        dice: null,
        doublesCount: 0,
        logs: [],
        chanceDeck: shuffleDeck(CHANCE_CARDS),
        communityDeck: shuffleDeck(COMMUNITY_CARDS),
        drawnCard: null,
        winner: null,
        houses_available: MAX_HOUSES,
        hotels_available: MAX_HOTELS,
        tradeOffer: null,
        auction: null,
        houseRules: DEFAULT_HOUSE_RULES,
        turnTimer: null,
        freeParkingPool: 0,
        tokenAnimState: 'IDLE',
        totalStepsPending: 0,
        targetPosition: null,
    };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {

        case 'SYNC_STATE': {
            return { ...action.state };
        }

        // ──────────────────────────── START GAME ────────────────────────────
        case 'START_GAME': {
            const currentRules = state.houseRules;
            const updatedPlayers: Player[] = action.players.map(p => ({
                ...p,
                money: STARTING_MONEY,
                position: 0,
                inJail: false,
                jailTurns: 0,
                hasGetOutOfJailCard: 0,
                isBankrupt: false,
                properties: [],
                isBot: (p as Player).isBot || false,
            }));

            const newOwned: Record<number, OwnedProperty> = {};

            // #97: Speed Mode — give 2 random properties to each player
            if (currentRules.speedMode) {
                const propertyIds = BOARD_SPACES
                    .filter(s => s.type === 'property')
                    .map(s => s.id)
                    .sort(() => Math.random() - 0.5);

                updatedPlayers.forEach(p => {
                    for (let i = 0; i < 2; i++) {
                        const sid = propertyIds.pop();
                        if (sid !== undefined) {
                            const space = BOARD_SPACES[sid];
                            p.properties.push(sid);
                            p.money -= (space.property?.price || 100);
                            newOwned[sid] = {
                                spaceId: sid,
                                ownerId: p.id,
                                houses: 0,
                                hasHotel: false,
                                isMortgaged: false,
                            };
                        }
                    }
                });
            }

            let newState: GameState = {
                ...createInitialState(),
                players: updatedPlayers,
                ownedProperties: newOwned,
                phase: 'rolling',
                houseRules: currentRules,
                turnTimer: Date.now() + 60000, // 60s
            };
            newState = addLog(newState, 'system', `🎲 A játék elkezdődött! ${updatedPlayers.length} játékos száll ringbe.${currentRules.speedMode ? ' (Gyors mód aktív: +2 ingatlan/fő)' : ''}`, 'system');
            return newState;
        }

        // ──────────────────────────── ROLL DICE ────────────────────────────
        case 'ROLL_DICE': {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (currentPlayer.isBankrupt) {
                return gameReducer(state, { type: 'END_TURN' });
            }

            const dice = rollDice();
            let newState: GameState = { ...state, dice };
            newState = addLog(newState, currentPlayer.id, `🎲 ${currentPlayer.name} dobott: ${dice.die1} + ${dice.die2} = ${dice.total}${dice.isDouble ? ' (DUPLA!)' : ''}`, 'roll');

            // Jail logic
            if (currentPlayer.inJail) {
                if (dice.isDouble) {
                    // Got out with doubles
                    const updatedPlayers = [...newState.players];
                    updatedPlayers[state.currentPlayerIndex] = {
                        ...currentPlayer,
                        inJail: false,
                        jailTurns: 0,
                    };
                    newState = { ...newState, players: updatedPlayers, doublesCount: 0 };
                    newState = addLog(newState, currentPlayer.id, `🔓 ${currentPlayer.name} duplát dobott és elhagyta a No-Fly Zone-t!`, 'jail');
                    // Phase: moving — a frontend indítja a szekvenciát
                    return { ...newState, phase: 'moving', totalStepsPending: dice.total, tokenAnimState: 'MOVING' };
                } else {
                    const newJailTurns = currentPlayer.jailTurns + 1;
                    if (newJailTurns >= 3) {
                        // Must pay and move
                        const updatedPlayers = [...newState.players];
                        updatedPlayers[state.currentPlayerIndex] = {
                            ...currentPlayer,
                            inJail: false,
                            jailTurns: 0,
                            money: currentPlayer.money - JAIL_FINE,
                        };
                        newState = { ...newState, players: updatedPlayers };
                        newState = addLog(newState, currentPlayer.id, `💰 ${currentPlayer.name} 3 kör után fizetett ${JAIL_FINE}k-t és kiszabadult.`, 'jail');
                        return { ...newState, phase: 'moving', totalStepsPending: dice.total, tokenAnimState: 'MOVING' };
                    } else {
                        const updatedPlayers = [...newState.players];
                        updatedPlayers[state.currentPlayerIndex] = {
                            ...currentPlayer,
                            jailTurns: newJailTurns,
                        };
                        newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                        newState = addLog(newState, currentPlayer.id, `🔒 ${currentPlayer.name} nem dobott duplát. Marad a No-Fly Zone-ban. (${newJailTurns}/3 kör)`, 'jail');
                        return newState;
                    }
                }
            }

            // Check triple doubles → jail
            const newDoublesCount = dice.isDouble ? state.doublesCount + 1 : 0;
            newState = { ...newState, doublesCount: newDoublesCount };

            if (newDoublesCount >= 3) {
                newState = addLog(newState, currentPlayer.id, `🚁 ${currentPlayer.name} 3x duplát dobott — No-Fly Zone!`, 'jail');
                return sendToJail(newState, state.currentPlayerIndex);
            }

            // Phase: moving — a frontend indítja az async szekvenciát
            return {
                ...newState,
                phase: 'moving',
                totalStepsPending: dice.total,
                tokenAnimState: 'MOVING'
            };
        }

        // ──────────────────────────── SET_TOKEN_ANIM ────────────────────────────
        case 'SET_TOKEN_ANIM': {
            return { ...state, tokenAnimState: action.animState };
        }

        case 'MOVE_STEP': {
            const cp = state.players[state.currentPlayerIndex];
            const nextPos = (cp.position + 1) % 40;
            const passedGo = nextPos === 0;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = {
                ...cp,
                position: nextPos,
                money: cp.money + (passedGo ? GO_SALARY : 0),
            };

            // AAA Sequence Check: Megérkeztünk? (Abszolút cél vagy elfogyott lépések)
            const stepsRemaining = Math.max(0, state.totalStepsPending - 1);
            const reachedTarget = state.targetPosition !== null && nextPos === state.targetPosition;
            const sequenceFinished = (state.totalStepsPending > 0 && stepsRemaining === 0) || reachedTarget;

            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                totalStepsPending: stepsRemaining,
                targetPosition: reachedTarget ? null : state.targetPosition,
                tokenAnimState: sequenceFinished ? 'IDLE' : 'MOVING'
            };

            if (passedGo) {
                newState = addLog(newState, cp.id, `➡️ ${cp.name} átlépte a START-ot és kapott ${GO_SALARY}k-t.`, 'system');
            }

            if (sequenceFinished) {
                return processLanding({ ...newState, phase: 'landed' });
            }

            return newState;
        }

        case 'MOVE_TELEPORT': {
            const cp = state.players[state.currentPlayerIndex];
            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = {
                ...cp,
                position: action.position,
                money: cp.money + (action.passedGo ? GO_SALARY : 0),
            };

            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                totalStepsPending: 0,
                tokenAnimState: 'IDLE'
            };

            if (action.passedGo) {
                newState = addLog(newState, cp.id, `➡️ ${cp.name} átlépte a START-ot és kapott ${GO_SALARY}k-t.`, 'system');
            }

            return processLanding({ ...newState, phase: 'landed' });
        }

        // ──────────────────────────── PAY JAIL FINE ────────────────────────────
        case 'PAY_JAIL_FINE': {
            const cp = state.players[state.currentPlayerIndex];
            if (!cp.inJail || cp.money < JAIL_FINE) return state;
            const updated = [...state.players];
            updated[state.currentPlayerIndex] = {
                ...cp,
                inJail: false,
                jailTurns: 0,
                money: cp.money - JAIL_FINE,
            };
            let newState: GameState = { ...state, players: updated, phase: 'rolling' };
            newState = addLog(newState, cp.id, `💰 ${cp.name} fizetett ${JAIL_FINE}k-t a No-Fly Zone elhagyásáért.`, 'jail');
            return newState;
        }

        // ──────────────────────────── USE JAIL CARD ────────────────────────────
        case 'USE_JAIL_CARD': {
            const cp = state.players[state.currentPlayerIndex];
            if (!cp.inJail || cp.hasGetOutOfJailCard <= 0) return state;
            const updated = [...state.players];
            updated[state.currentPlayerIndex] = {
                ...cp,
                inJail: false,
                jailTurns: 0,
                hasGetOutOfJailCard: cp.hasGetOutOfJailCard - 1,
            };
            // #39: Return the get-out-of-jail card to the bottom of the deck
            const chanceJailCard = CHANCE_CARDS.find(c => c.action.kind === 'get-out-of-jail');
            const communityJailCard = COMMUNITY_CARDS.find(c => c.action.kind === 'get-out-of-jail');
            const newChanceDeck = [...state.chanceDeck];
            const newCommunityDeck = [...state.communityDeck];
            // Return to chance deck if it's missing from there
            if (chanceJailCard && !newChanceDeck.find(c => c.id === chanceJailCard.id)) {
                newChanceDeck.push(chanceJailCard);
            } else if (communityJailCard && !newCommunityDeck.find(c => c.id === communityJailCard.id)) {
                newCommunityDeck.push(communityJailCard);
            }
            let newState: GameState = { ...state, players: updated, phase: 'rolling', chanceDeck: newChanceDeck, communityDeck: newCommunityDeck };
            newState = addLog(newState, cp.id, `🃏 ${cp.name} felhasználta az "Ingyen szabadulsz" kártyát!`, 'jail');
            return newState;
        }

        // ──────────────────────────── BUY PROPERTY ────────────────────────────
        case 'BUY_PROPERTY': {
            const cp = state.players[state.currentPlayerIndex];
            const space = BOARD_SPACES[cp.position];
            const price = space.property?.price || space.railroad?.price || space.utility?.price;
            if (!price || state.ownedProperties[space.id] || cp.money < price) return state;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = {
                ...cp,
                money: cp.money - price,
                properties: [...cp.properties, space.id],
            };
            const newOwned = {
                ...state.ownedProperties,
                [space.id]: {
                    spaceId: space.id,
                    ownerId: cp.id,
                    houses: 0,
                    hasHotel: false,
                    isMortgaged: false,
                },
            };
            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                phase: 'turn-end',
                tokenAnimState: 'ACTION',
            };
            newState = addLog(newState, cp.id, `🏠 ${cp.name} megvásárolta: ${space.name} (${price}k)`, 'buy');
            return newState;
        }

        // ──────────────────────────── BUILD HOUSE ────────────────────────────
        case 'BUILD_HOUSE': {
            const cp = state.players[state.currentPlayerIndex];
            if (!canBuildHouse(state, cp.id, action.spaceId)) return state;
            const space = BOARD_SPACES[action.spaceId];
            const cost = space.property!.houseCost;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - cost };
            const owned = state.ownedProperties[action.spaceId];
            const newOwned = {
                ...state.ownedProperties,
                [action.spaceId]: { ...owned, houses: owned.houses + 1 },
            };
            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                houses_available: state.houses_available - 1,
            };
            newState = addLog(newState, cp.id, `📊 ${cp.name} LOD szintet telepített: ${space.name} (LOD ${(owned.houses + 1) * 100}, ${cost}k)`, 'build');
            return newState;
        }

        // ──────────────────────────── BUILD HOTEL ────────────────────────────
        case 'BUILD_HOTEL': {
            const cp = state.players[state.currentPlayerIndex];
            if (!canBuildHotel(state, cp.id, action.spaceId)) return state;
            const space = BOARD_SPACES[action.spaceId];
            const cost = space.property!.houseCost;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - cost };
            const owned = state.ownedProperties[action.spaceId];
            const newOwned = {
                ...state.ownedProperties,
                [action.spaceId]: { ...owned, houses: 0, hasHotel: true },
            };
            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                houses_available: state.houses_available + 4,
                hotels_available: state.hotels_available - 1,
            };
            newState = addLog(newState, cp.id, `🌐 ${cp.name} Digitális Ikert hozott létre: ${space.name} (${cost}k)`, 'build');
            return newState;
        }

        // ──────────────────────────── SELL HOUSE (#23) ────────────────────────────
        case 'SELL_HOUSE': {
            const cp = state.players[state.currentPlayerIndex];
            if (!canSellHouse(state, cp.id, action.spaceId)) return state;
            const space = BOARD_SPACES[action.spaceId];
            const sellPrice = Math.floor(space.property!.houseCost / 2);
            const owned = state.ownedProperties[action.spaceId];
            let newHouses = owned.houses;
            let newHasHotel = owned.hasHotel;
            let housesBack = 0;
            let hotelsBack = 0;
            let sellAmount = 0;

            if (owned.hasHotel) {
                newHasHotel = false;
                hotelsBack = 1;
                if (state.houses_available >= 4) {
                    newHouses = 4; // Downgrade: hotel → 4 houses
                    sellAmount = sellPrice; // Paid for the 5th building
                } else {
                    newHouses = 0; // No houses available → straight to 0
                    sellAmount = sellPrice * 5; // Paid for all 5 buildings (#Audit fix)
                }
            } else {
                newHouses = owned.houses - 1;
                housesBack = 1;
                sellAmount = sellPrice;
            }

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money + sellAmount };

            const newOwned = {
                ...state.ownedProperties,
                [action.spaceId]: { ...owned, houses: newHouses, hasHotel: newHasHotel },
            };
            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                houses_available: state.houses_available + housesBack - (owned.hasHotel && state.houses_available >= 4 ? 4 : 0),
                hotels_available: state.hotels_available + hotelsBack,
            };
            newState = addLog(newState, cp.id, `🏚️ ${cp.name} eladott egy épületet: ${space.name} (+${sellAmount}k)`, 'build');
            return newState;
        }

        // ──────────────────────────── MORTGAGE ────────────────────────────
        case 'MORTGAGE_PROPERTY': {
            const cp = state.players[state.currentPlayerIndex];
            const owned = state.ownedProperties[action.spaceId];
            if (!owned || owned.ownerId !== cp.id || owned.isMortgaged) return state;
            if (owned.houses > 0 || owned.hasHotel) return state;

            const space = BOARD_SPACES[action.spaceId];
            const mortgageValue = space.property?.mortgageValue || space.railroad?.mortgageValue || space.utility?.mortgageValue || 0;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money + mortgageValue };
            const newOwned = {
                ...state.ownedProperties,
                [action.spaceId]: { ...owned, isMortgaged: true },
            };
            let newState: GameState = { ...state, players: updatedPlayers, ownedProperties: newOwned };
            newState = addLog(newState, cp.id, `🏦 ${cp.name} jelzálogba adta: ${space.name} (+${mortgageValue}k)`, 'mortgage');
            return newState;
        }

        // ──────────────────────────── UNMORTGAGE ────────────────────────────
        case 'UNMORTGAGE_PROPERTY': {
            const cp = state.players[state.currentPlayerIndex];
            const owned = state.ownedProperties[action.spaceId];
            if (!owned || owned.ownerId !== cp.id || !owned.isMortgaged) return state;

            const space = BOARD_SPACES[action.spaceId];
            const mortgageValue = space.property?.mortgageValue || space.railroad?.mortgageValue || space.utility?.mortgageValue || 0;
            const unmortgageCost = Math.ceil(mortgageValue * 1.1);
            if (cp.money < unmortgageCost) return state;

            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - unmortgageCost };
            const newOwned = {
                ...state.ownedProperties,
                [action.spaceId]: { ...owned, isMortgaged: false },
            };
            let newState: GameState = { ...state, players: updatedPlayers, ownedProperties: newOwned };
            newState = addLog(newState, cp.id, `✅ ${cp.name} kiváltotta a jelzálogot: ${space.name} (-${unmortgageCost}k)`, 'mortgage');
            return newState;
        }

        // ──────────────────────────── RESOLVE CARD ────────────────────────────
        case 'RESOLVE_CARD': {
            if (!state.drawnCard) return { ...state, phase: 'turn-end', drawnCard: null };
            const cp = state.players[state.currentPlayerIndex];
            const card = state.drawnCard;
            let newState: GameState = { ...state, drawnCard: null };

            switch (card.action.kind) {
                case 'collect': {
                    const updatedPlayers = [...newState.players];
                    updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money + card.action.amount };
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `💵 ${cp.name} kapott ${card.action.amount}k-t.`, 'card');
                    break;
                }
                case 'pay': {
                    const updatedPlayers = [...newState.players];
                    updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - card.action.amount };
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `💸 ${cp.name} fizetett ${card.action.amount}k-t.`, 'card');
                    break;
                }
                case 'move-to': {
                    // AAA Movement: teleport helyett szekvenciális léptetés
                    return {
                        ...newState,
                        phase: 'moving',
                        targetPosition: card.action.position,
                        tokenAnimState: 'MOVING'
                    };
                }
                case 'move-back': {
                    const updatedPlayers = [...newState.players];
                    const newPos = (cp.position - card.action.spaces + 40) % 40;
                    updatedPlayers[state.currentPlayerIndex] = { ...cp, position: newPos };
                    newState = { ...newState, players: updatedPlayers };
                    return processLanding(newState);
                }
                case 'go-to-jail': {
                    return sendToJail(newState, state.currentPlayerIndex);
                }
                case 'get-out-of-jail': {
                    const updatedPlayers = [...newState.players];
                    updatedPlayers[state.currentPlayerIndex] = {
                        ...cp,
                        hasGetOutOfJailCard: cp.hasGetOutOfJailCard + 1,
                    };
                    // #39: Remove the get-out-of-jail card from the deck (don't put it back)
                    // The card was already shift()-ed from the deck.
                    // We need to remove the pushed-back card from the end of the deck.
                    const deckType = card.type === 'chance' ? 'chanceDeck' : 'communityDeck';
                    const filteredDeck = [...newState[deckType]];
                    const cardIdx = filteredDeck.findIndex(c => c.id === card.id);
                    if (cardIdx !== -1) filteredDeck.splice(cardIdx, 1);
                    newState = { ...newState, [deckType]: filteredDeck, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `🃏 ${cp.name} kapott egy "Ingyen szabadulsz" kártyát.`, 'card');
                    break;
                }
                case 'repairs': {
                    const cost = calculateRepairs(newState, cp.id, card.action.perHouse, card.action.perHotel);
                    const updatedPlayers = [...newState.players];
                    updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - cost };
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `🔧 ${cp.name} javítási díjat fizetett: ${cost}k.`, 'card');
                    break;
                }
                case 'pay-each-player': {
                    const act = card.action as { kind: 'pay-each-player'; amount: number };
                    const activePlayers = newState.players.filter(p => !p.isBankrupt && p.id !== cp.id);
                    const totalCost = act.amount * activePlayers.length;
                    const updatedPlayers = newState.players.map(p => {
                        if (p.id === cp.id) return { ...p, money: p.money - totalCost };
                        if (!p.isBankrupt) return { ...p, money: p.money + act.amount };
                        return p;
                    });
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `💸 ${cp.name} fizetett minden játékosnak ${act.amount}k-t.`, 'card');
                    break;
                }
                case 'collect-from-each': {
                    const act = card.action as { kind: 'collect-from-each'; amount: number };
                    const activePlayers = newState.players.filter(p => !p.isBankrupt && p.id !== cp.id);
                    const totalGain = act.amount * activePlayers.length;
                    const updatedPlayers = newState.players.map(p => {
                        if (p.id === cp.id) return { ...p, money: p.money + totalGain };
                        if (!p.isBankrupt) return { ...p, money: p.money - act.amount };
                        return p;
                    });
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `💵 ${cp.name} kapott minden játékostól ${act.amount}k-t.`, 'card');
                    break;
                }
                case 'advance-to-nearest-railroad': {
                    const target = nearestRailroad(cp.position);
                    return { ...newState, phase: 'moving', targetPosition: target, tokenAnimState: 'MOVING' };
                }
                case 'advance-to-nearest-utility': {
                    const target = nearestUtility(cp.position);
                    return { ...newState, phase: 'moving', targetPosition: target, tokenAnimState: 'MOVING' };
                }
            }

            return newState;
        }

        // ──────────────────────────── END TURN ────────────────────────────
        case 'END_TURN': {
            const cp = state.players[state.currentPlayerIndex];

            // Check bankruptcy
            if (cp.money < 0) {
                return gameReducer(state, { type: 'DECLARE_BANKRUPTCY' });
            }

            // Timer lejárt → azonnal következő játékos, dupla-dobás nem számít
            const timerExpired = state.turnTimer != null && Date.now() > state.turnTimer;

            // If doubled and not in jail AND timer still active, roll again
            if (!timerExpired && state.dice?.isDouble && !cp.inJail && state.doublesCount > 0) {
                return { ...state, phase: 'rolling', drawnCard: null };
            }

            // Next player
            let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
            let safety = 0;
            while (state.players[nextIndex].isBankrupt && safety < state.players.length) {
                nextIndex = (nextIndex + 1) % state.players.length;
                safety++;
            }

            // Check if game is over
            const activePlayers = state.players.filter(p => !p.isBankrupt);
            if (activePlayers.length <= 1) {
                let newState: GameState = {
                    ...state,
                    phase: 'game-over',
                    winner: activePlayers[0]?.id || null,
                };
                newState = addLog(newState, activePlayers[0]?.id || 'system', `🏆 ${activePlayers[0]?.name || '???'} nyerte a játékot!`, 'system');
                return newState;
            }

            let newState: GameState = {
                ...state,
                currentPlayerIndex: nextIndex,
                phase: 'rolling',
                dice: null,
                doublesCount: 0,
                drawnCard: null,
                turnTimer: Date.now() + 60000,
                tokenAnimState: 'IDLE',
            };
            newState = addLog(newState, state.players[nextIndex].id, `▶️ ${state.players[nextIndex].name} köre következik.`, 'system');
            return newState;
        }

        // ──────────────────────────── DECLARE BANKRUPTCY (#71, #72) ────────────────────────────
        case 'DECLARE_BANKRUPTCY': {
            const cp = state.players[state.currentPlayerIndex];
            const creditorId = action.creditorId;
            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, isBankrupt: true, money: 0, properties: [] };

            const newOwned = { ...state.ownedProperties };

            if (creditorId) {
                // #71: Bankruptcy TO A PLAYER — transfer all properties + money to creditor
                const creditor = state.players.find(p => p.id === creditorId);
                if (creditor) {
                    const totalTransfer = Math.max(0, cp.money); // any remaining money
                    const transferredProps: number[] = [];

                    cp.properties.forEach(sid => {
                        const owned = newOwned[sid];
                        if (owned) {
                            // Transfer property — mortgaged properties stay mortgaged, creditor must pay 10% or unmortgage
                            newOwned[sid] = { ...owned, ownerId: creditorId, houses: 0, hasHotel: false };
                            transferredProps.push(sid);
                        }
                    });

                    // Update creditor's money and properties
                    updatedPlayers.forEach((p, i) => {
                        if (p.id === creditorId) {
                            updatedPlayers[i] = {
                                ...p,
                                money: p.money + totalTransfer,
                                properties: [...p.properties, ...transferredProps],
                            };
                        }
                    });
                }
            } else {
                // #72: Bankruptcy TO THE BANK — properties return to bank unmortgaged
                cp.properties.forEach(sid => {
                    delete newOwned[sid];
                });
            }

            // Return any houses/hotels to bank supply
            let housesReturned = 0;
            let hotelsReturned = 0;
            cp.properties.forEach(sid => {
                const prevOwned = state.ownedProperties[sid];
                if (prevOwned) {
                    housesReturned += prevOwned.houses;
                    if (prevOwned.hasHotel) hotelsReturned += 1;
                }
            });

            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                houses_available: state.houses_available + housesReturned,
                hotels_available: state.hotels_available + hotelsReturned,
            };
            newState = addLog(newState, cp.id, `💀 ${cp.name} csődbe ment!${creditorId ? ` Vagyona ${state.players.find(p => p.id === creditorId)?.name}-hoz/-hez került.` : ' Ingatlanjai visszakerültek a bankhoz.'}`, 'bankrupt');

            // Check if game over
            const activePlayers = newState.players.filter(p => !p.isBankrupt);
            if (activePlayers.length <= 1) {
                newState = {
                    ...newState,
                    phase: 'game-over',
                    winner: activePlayers[0]?.id || null,
                };
                newState = addLog(newState, activePlayers[0]?.id || 'system', `🏆 ${activePlayers[0]?.name || '???'} nyerte a játékot!`, 'system');
                return newState;
            }

            return gameReducer(newState, { type: 'END_TURN' });
        }

        // ──────────────────────────── DECLINE PROPERTY → AUCTION (#58) ────────────────────────────
        case 'DECLINE_PROPERTY': {
            const cp = state.players[state.currentPlayerIndex];
            const space = BOARD_SPACES[cp.position];
            const isOwnable = ['property', 'railroad', 'utility'].includes(space.type);
            const isUnowned = isOwnable && !state.ownedProperties[space.id];
            if (!isUnowned) return gameReducer(state, { type: 'END_TURN' });

            // Start auction — all non-bankrupt players participate
            const activeBidders = state.players
                .filter(p => !p.isBankrupt)
                .map(p => p.id);

            const auction: AuctionState = {
                spaceId: space.id,
                currentBid: 0,
                currentBidderId: null,
                activeBidders,
                currentBidderIndex: 0,
            };

            let newState: GameState = { ...state, phase: 'auction', auction };
            newState = addLog(newState, cp.id, `🔨 ${cp.name} nem vásárolta meg: ${space.name}. Árverés indul!`, 'auction');
            return newState;
        }

        // ──────────────────────────── AUCTION BID (#59-60) ────────────────────────────
        case 'AUCTION_BID': {
            if (!state.auction) return state;
            const auction = state.auction;
            const bidderId = auction.activeBidders[auction.currentBidderIndex];
            const bidder = state.players.find(p => p.id === bidderId);
            if (!bidder) return state;

            const bidAmount = action.amount;
            // #62: Can't bid more than you have
            if (bidAmount <= auction.currentBid || bidAmount > bidder.money) return state;

            const nextIndex = (auction.currentBidderIndex + 1) % auction.activeBidders.length;
            const newAuction: AuctionState = {
                ...auction,
                currentBid: bidAmount,
                currentBidderId: bidderId,
                currentBidderIndex: nextIndex,
            };

            let newState: GameState = { ...state, auction: newAuction };
            newState = addLog(newState, bidderId, `🔨 ${bidder.name} licitált: ${bidAmount}k`, 'auction');
            return newState;
        }

        // ──────────────────────────── AUCTION PASS (#61) ────────────────────────────
        case 'AUCTION_PASS': {
            if (!state.auction) return state;
            const auction = state.auction;
            const passerId = auction.activeBidders[auction.currentBidderIndex];
            const passer = state.players.find(p => p.id === passerId);

            const newBidders = auction.activeBidders.filter(id => id !== passerId);

            // If only one bidder left (or none), auction ends
            if (newBidders.length <= 1 && auction.currentBidderId) {
                // Winner! Sell to highest bidder
                const winnerId = auction.currentBidderId;
                const winner = state.players.find(p => p.id === winnerId);
                if (!winner || auction.currentBid > winner.money) {
                    // Can't afford — auction fails
                    let newState: GameState = { ...state, auction: null, phase: 'turn-end' };
                    newState = addLog(newState, 'system', '🔨 Árverés eredménytelen — senki nem licitált.', 'auction');
                    return newState;
                }

                const space = BOARD_SPACES[auction.spaceId];
                const updatedPlayers = state.players.map(p =>
                    p.id === winnerId
                        ? { ...p, money: p.money - auction.currentBid, properties: [...p.properties, auction.spaceId] }
                        : p
                );
                const newOwned = {
                    ...state.ownedProperties,
                    [auction.spaceId]: {
                        spaceId: auction.spaceId,
                        ownerId: winnerId,
                        houses: 0,
                        hasHotel: false,
                        isMortgaged: false,
                    },
                };
                let newState: GameState = {
                    ...state,
                    players: updatedPlayers,
                    ownedProperties: newOwned,
                    auction: null,
                    phase: 'turn-end',
                };
                newState = addLog(newState, winnerId, `🔨 ${winner.name} megnyerte az árverést: ${space.name} — ${auction.currentBid}k`, 'auction');
                return newState;
            }

            if (newBidders.length === 0) {
                // Nobody bid
                let newState: GameState = { ...state, auction: null, phase: 'turn-end' };
                newState = addLog(newState, 'system', '🔨 Árverés eredménytelen — senki nem licitált.', 'auction');
                return newState;
            }

            const adjustedIndex = auction.currentBidderIndex >= newBidders.length ? 0 : auction.currentBidderIndex;
            const newAuction: AuctionState = {
                ...auction,
                activeBidders: newBidders,
                currentBidderIndex: adjustedIndex,
            };

            let newState: GameState = { ...state, auction: newAuction };
            if (passer) {
                newState = addLog(newState, passerId, `🔨 ${passer.name} kiszállt az árverésből.`, 'auction');
            }
            return newState;
        }

        // ──────────────────────────── PROPOSE TRADE (#51-57) ────────────────────────────
        case 'PROPOSE_TRADE': {
            const offer = action.offer;
            // Validate: can't trade with buildings
            for (const sid of [...offer.offeredProperties, ...offer.requestedProperties]) {
                const owned = state.ownedProperties[sid];
                if (owned && (owned.houses > 0 || owned.hasHotel)) {
                    return state; // #53: can't trade improved properties
                }
            }

            let newState: GameState = { ...state, tradeOffer: offer, phase: 'trading' };
            const fromPlayer = state.players.find(p => p.id === offer.fromPlayerId);
            const toPlayer = state.players.find(p => p.id === offer.toPlayerId);
            newState = addLog(newState, offer.fromPlayerId,
                `🤝 ${fromPlayer?.name} kereskedési ajánlatot tett ${toPlayer?.name}-nak/-nek.`, 'trade');
            return newState;
        }

        // ──────────────────────────── ACCEPT TRADE ────────────────────────────
        case 'ACCEPT_TRADE': {
            const offer = state.tradeOffer;
            if (!offer) return state;

            const from = state.players.find(p => p.id === offer.fromPlayerId);
            const to = state.players.find(p => p.id === offer.toPlayerId);
            if (!from || !to) return state;

            // Check money
            if (from.money < offer.offeredMoney || to.money < offer.requestedMoney) return state;

            // Transfer properties & money
            const newOwned = { ...state.ownedProperties };
            const updatedPlayers = state.players.map(p => {
                if (p.id === offer.fromPlayerId) {
                    let newProps = p.properties.filter(sid => !offer.offeredProperties.includes(sid));
                    newProps = [...newProps, ...offer.requestedProperties];
                    return {
                        ...p,
                        properties: newProps,
                        money: p.money - offer.offeredMoney + offer.requestedMoney,
                    };
                }
                if (p.id === offer.toPlayerId) {
                    let newProps = p.properties.filter(sid => !offer.requestedProperties.includes(sid));
                    newProps = [...newProps, ...offer.offeredProperties];
                    return {
                        ...p,
                        properties: newProps,
                        money: p.money - offer.requestedMoney + offer.offeredMoney,
                    };
                }
                return p;
            });

            // Update owned property IDs
            offer.offeredProperties.forEach(sid => {
                if (newOwned[sid]) newOwned[sid] = { ...newOwned[sid], ownerId: offer.toPlayerId };
            });
            offer.requestedProperties.forEach(sid => {
                if (newOwned[sid]) newOwned[sid] = { ...newOwned[sid], ownerId: offer.fromPlayerId };
            });

            let newState: GameState = {
                ...state,
                players: updatedPlayers,
                ownedProperties: newOwned,
                tradeOffer: null,
                phase: 'turn-end',
            };
            newState = addLog(newState, offer.fromPlayerId,
                `🤝 ${from.name} és ${to.name} kereskedelme sikeresen létrejött!`, 'trade');
            return newState;
        }

        // ──────────────────────────── REJECT / CANCEL TRADE ────────────────────────────
        case 'REJECT_TRADE': {
            const offer = state.tradeOffer;
            const toPlayer = offer ? state.players.find(p => p.id === offer.toPlayerId) : null;
            let newState: GameState = { ...state, tradeOffer: null, phase: 'turn-end' };
            if (toPlayer) {
                newState = addLog(newState, toPlayer.id, `❌ ${toPlayer.name} elutasította a kereskedési ajánlatot.`, 'trade');
            }
            return newState;
        }

        case 'CANCEL_TRADE': {
            return { ...state, tradeOffer: null, phase: 'turn-end' };
        }

        // ──────────────────────────── HOUSE RULES (#93-97) ────────────────────────────
        case 'SET_HOUSE_RULES': {
            return { ...state, houseRules: action.rules };
        }

        // ──────────────────────────── DEBUG ACTIONS (#9, #99) ────────────────────────────
        case 'DEBUG_SET_MONEY' as never: {
            const a = action as unknown as { playerId: string; amount: number };
            const updatedPlayers = state.players.map(p =>
                p.id === a.playerId ? { ...p, money: a.amount } : p
            );
            let newState: GameState = { ...state, players: updatedPlayers };
            newState = addLog(newState, 'system', `🔧 [DEBUG] Pénz beállítva: ${a.amount}k`, 'system');
            return newState;
        }

        case 'DEBUG_SET_POSITION' as never: {
            const a = action as unknown as { playerId: string; position: number };
            const updatedPlayers = state.players.map(p =>
                p.id === a.playerId ? { ...p, position: a.position } : p
            );
            let newState: GameState = { ...state, players: updatedPlayers };
            newState = addLog(newState, 'system', `🔧 [DEBUG] Pozíció: ${a.position} (${BOARD_SPACES[a.position]?.name})`, 'system');
            return newState;
        }

        case 'DEBUG_FORCE_DICE' as never: {
            const a = action as unknown as { die1: number; die2: number };
            const forcedDice = { die1: a.die1, die2: a.die2, isDouble: a.die1 === a.die2, total: a.die1 + a.die2 };
            let newState: GameState = { ...state, dice: forcedDice };
            newState = addLog(newState, 'system', `🔧 [DEBUG] Kocka kényszerítés: ${a.die1}+${a.die2}=${a.die1 + a.die2}`, 'system');
            return newState;
        }

        case 'DEBUG_GIVE_PROPERTY' as never: {
            const a = action as unknown as { playerId: string; spaceId: number };
            if (state.ownedProperties[a.spaceId]) return state;
            const player = state.players.find(p => p.id === a.playerId);
            if (!player) return state;
            const updatedPlayers = state.players.map(p =>
                p.id === a.playerId ? { ...p, properties: [...p.properties, a.spaceId] } : p
            );
            const newOwned = {
                ...state.ownedProperties,
                [a.spaceId]: { spaceId: a.spaceId, ownerId: a.playerId, houses: 0, hasHotel: false, isMortgaged: false },
            };
            let newState: GameState = { ...state, players: updatedPlayers, ownedProperties: newOwned };
            newState = addLog(newState, 'system', `🔧 [DEBUG] Ingatlan adva: ${BOARD_SPACES[a.spaceId]?.name}`, 'system');
            return newState;
        }

        default:
            return state;
    }
}

// processMovement eltávolítva - helyette MOVE_STEP / MOVE_TELEPORT van AAA logikával

// ============================================================
// HELPER: Process Landing on a Space
// ============================================================
function processLanding(state: GameState): GameState {
    const cp = state.players[state.currentPlayerIndex];
    const space = BOARD_SPACES[cp.position];
    let newState = { ...state };

    newState = addLog(newState, cp.id, `📍 ${cp.name} a(z) "${space.name}" mezőre lépett.`, 'system');

    switch (space.type) {
        case 'go':
            // #94: Double on GO rule
            if (state.houseRules.doubleOnGo) {
                const updatedPlayers = [...state.players];
                updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money + GO_SALARY };
                newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                newState = addLog(newState, cp.id, `🎯 ${cp.name} pontosan a START-ra lépett! Dupla fizetést kap.`, 'system');
            } else {
                newState = { ...newState, phase: 'turn-end' };
            }
            break;

        case 'property':
        case 'railroad':
        case 'utility': {
            const owner = state.ownedProperties[space.id];
            if (!owner) {
                // Unowned — offer purchase
                newState = { ...newState, phase: 'landed' };
            } else if (owner.ownerId !== cp.id && !owner.isMortgaged) {
                // Pay rent
                const diceTotal = state.dice?.total || 7;
                const rent = calculateRent(state, space, diceTotal);
                const ownerPlayer = state.players.find(p => p.id === owner.ownerId);
                if (ownerPlayer && !ownerPlayer.isBankrupt) {
                    const updatedPlayers = state.players.map(p => {
                        if (p.id === cp.id) return { ...p, money: p.money - rent };
                        if (p.id === owner.ownerId) return { ...p, money: p.money + rent };
                        return p;
                    });
                    newState = { ...newState, players: updatedPlayers, phase: 'turn-end' };
                    newState = addLog(newState, cp.id, `💰 ${cp.name} fizetett ${rent}k bérleti díjat ${ownerPlayer.name}-nak/-nek.`, 'rent');
                } else {
                    newState = { ...newState, phase: 'turn-end' };
                }
            } else {
                newState = { ...newState, phase: 'turn-end' };
            }
            break;
        }

        case 'tax': {
            let amount = space.tax!.amount;

            // #95: Income Tax 10% option
            if (space.name.includes('Jövedelemadó') && state.houseRules.incomeTax_percentage) {
                const netWorth = calculateNetWorth(state, cp.id);
                const tenPercent = Math.floor(netWorth * 0.1);
                // Usually the choice is "pay 200 or 10%", so we auto-choose the better for player
                if (tenPercent < amount) {
                    amount = tenPercent;
                }
            }

            // #93: Jackpot rule — add tax to pool
            const newPool = state.houseRules.freeParking_jackpot ? state.freeParkingPool + amount : state.freeParkingPool;
            const updatedPlayers = [...state.players];
            updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money - amount };
            newState = { ...newState, players: updatedPlayers, freeParkingPool: newPool, phase: 'turn-end' };
            newState = addLog(newState, cp.id, `💸 ${cp.name} fizetett ${amount}k adót.${state.houseRules.freeParking_jackpot ? ' (A Parkoló Jackpotba került)' : ''}`, 'system');
            break;
        }

        case 'free-parking': {
            // #93: Free Parking Jackpot
            if (state.houseRules.freeParking_jackpot && state.freeParkingPool > 0) {
                const amount = state.freeParkingPool;
                const updatedPlayers = [...state.players];
                updatedPlayers[state.currentPlayerIndex] = { ...cp, money: cp.money + amount };
                newState = { ...newState, players: updatedPlayers, freeParkingPool: 0, phase: 'turn-end' };
                newState = addLog(newState, cp.id, `🅿️ ${cp.name} megnyerte a Parkoló Jackpotot: ${amount}k!`, 'system');
            } else {
                newState = { ...newState, phase: 'turn-end' };
            }
            break;
        }

        case 'chance': {
            const deck = [...newState.chanceDeck];
            const card = deck.shift()!;
            deck.push(card);
            newState = { ...newState, chanceDeck: deck, drawnCard: card, phase: 'card-drawn' };
            newState = addLog(newState, cp.id, `🎴 Esély kártya: "${card.text}"`, 'card');
            break;
        }

        case 'community': {
            const deck = [...newState.communityDeck];
            const card = deck.shift()!;
            deck.push(card);
            newState = { ...newState, communityDeck: deck, drawnCard: card, phase: 'card-drawn' };
            newState = addLog(newState, cp.id, `🎴 Közösségi Alap: "${card.text}"`, 'card');
            break;
        }

        case 'jail':
            newState = { ...newState, phase: 'turn-end' };
            newState = addLog(newState, cp.id, `👀 ${cp.name} csak átrepült a No-Fly Zone felett.`, 'system');
            break;



        case 'go-to-jail':
            newState = addLog(newState, cp.id, `🚁 ${cp.name} a No-Fly Zone-ba került!`, 'jail');
            return sendToJail(newState, state.currentPlayerIndex);

        default:
            newState = { ...newState, phase: 'turn-end' };
    }

    return newState;
}

// ============================================================
// HELPER: Send to Jail
// ============================================================
function sendToJail(state: GameState, playerIndex: number): GameState {
    const updatedPlayers = [...state.players];
    updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        position: 10,
        inJail: true,
        jailTurns: 0,
    };
    return { ...state, players: updatedPlayers, phase: 'turn-end', doublesCount: 0 };
}
