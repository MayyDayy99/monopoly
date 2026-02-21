// ============================================================
// LORICATUS-OPOLY — TYPE DEFINITIONS
// ============================================================

// ---- Token Animation State ----
export type TokenAnimState = 'IDLE' | 'MOVING' | 'ACTION';

// ---- Color Groups ----
export type ColorGroup =
    | 'brown'
    | 'lightblue'
    | 'pink'
    | 'orange'
    | 'red'
    | 'yellow'
    | 'green'
    | 'darkblue';

export type SpaceType =
    | 'property'
    | 'railroad'
    | 'utility'
    | 'tax'
    | 'chance'
    | 'community'
    | 'go'
    | 'jail'
    | 'free-parking'
    | 'go-to-jail';

// ---- Board Space ----
export interface PropertyData {
    colorGroup: ColorGroup;
    price: number;
    rentBase: number;
    rent1H: number;
    rent2H: number;
    rent3H: number;
    rent4H: number;
    rentHotel: number;
    houseCost: number;
    mortgageValue: number;
}

export interface RailroadData {
    price: number;
    mortgageValue: number;
}

export interface UtilityData {
    price: number;
    mortgageValue: number;
}

export interface TaxData {
    amount: number;
}

export interface BoardSpace {
    id: number;
    name: string;
    type: SpaceType;
    property?: PropertyData;
    railroad?: RailroadData;
    utility?: UtilityData;
    tax?: TaxData;
}

// ---- Owned Property State ----
export interface OwnedProperty {
    spaceId: number;
    ownerId: string;
    houses: number;       // 0-4
    hasHotel: boolean;
    isMortgaged: boolean;
}

// ---- Player ----
export interface Player {
    id: string;
    name: string;
    color: string;
    token: string;        // emoji bábu
    money: number;
    position: number;
    inJail: boolean;
    jailTurns: number;
    hasGetOutOfJailCard: number; // count
    isBankrupt: boolean;
    properties: number[]; // spaceId[]
    isBot: boolean;       // P2: AI bot (#73-76)
}

// ---- Cards ----
export type CardType = 'chance' | 'community';

export interface GameCard {
    id: string;
    type: CardType;
    text: string;
    action: CardAction;
}

export type CardAction =
    | { kind: 'collect'; amount: number }
    | { kind: 'pay'; amount: number }
    | { kind: 'move-to'; position: number }
    | { kind: 'move-back'; spaces: number }
    | { kind: 'go-to-jail' }
    | { kind: 'get-out-of-jail' }
    | { kind: 'repairs'; perHouse: number; perHotel: number }
    | { kind: 'pay-each-player'; amount: number }
    | { kind: 'collect-from-each'; amount: number }
    | { kind: 'advance-to-nearest-railroad' }
    | { kind: 'advance-to-nearest-utility' };

// ---- Dice ----
export interface DiceResult {
    die1: number;
    die2: number;
    isDouble: boolean;
    total: number;
}

// ---- Log Entry ----
export interface LogEntry {
    id: string;
    timestamp: number;
    playerId: string;
    message: string;
    type: 'roll' | 'buy' | 'rent' | 'card' | 'jail' | 'build' | 'mortgage' | 'trade' | 'system' | 'bankrupt' | 'auction';
}

// ---- Game Phase ----
export type GamePhase =
    | 'setup'
    | 'rolling'
    | 'moving'
    | 'landed'
    | 'card-drawn'
    | 'turn-end'
    | 'auction'      // P1: aukció fázis (#58-62)
    | 'trading'      // P1: kereskedelem fázis (#51-57)
    | 'game-over';

// ---- Trade Offer (#51-57) ----
export interface TradeOffer {
    fromPlayerId: string;
    toPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    offeredMoney: number;
    requestedMoney: number;
}

// ---- Auction State (#58-62) ----
export interface AuctionState {
    spaceId: number;
    currentBid: number;
    currentBidderId: string | null;
    activeBidders: string[];  // player IDs who haven't passed
    currentBidderIndex: number;
}

// ---- House Rules (#93-97) ----
export interface HouseRules {
    freeParking_jackpot: boolean;   // #93: Ingyenes Parkoló = begyűjtött adók/bírságok
    doubleOnGo: boolean;            // #94: Start mező pontos leesikés = duplázás
    incomeTax_percentage: boolean;   // #95: Jövedelemadó 10% opció
    noRentInJail: boolean;          // #96: Börtönben nincs bérleti díj
    speedMode: boolean;             // #97: Gyors mód (kezdőcsomag)
    colorblindMode: boolean;        // #89: Színtévesztő mód
}

// ---- Game State ----
export interface GameState {
    phase: GamePhase;
    players: Player[];
    currentPlayerIndex: number;
    ownedProperties: Record<number, OwnedProperty>;
    dice: DiceResult | null;
    doublesCount: number;
    logs: LogEntry[];
    chanceDeck: GameCard[];
    communityDeck: GameCard[];
    drawnCard: GameCard | null;
    winner: string | null;
    houses_available: number;
    hotels_available: number;
    tradeOffer: TradeOffer | null;
    auction: AuctionState | null;  // P1: aukció állapot
    houseRules: HouseRules;        // P2: házi szabályok (#93-97)
    turnTimer: number | null;      // P2: köridő (mpillás vege timestamp) (#67)
    freeParkingPool: number;       // P2: ingyenes parkoló jackpot (#93)
    tokenAnimState: TokenAnimState; // Állapotalapú animáció (IDLE/MOVING/ACTION)
    // --- Új mezők a szekvenciális mozgáshoz (AAA PhysX) ---
    totalStepsPending: number;
    targetPosition: number | null;
}

// ---- Actions ----
export type GameAction =
    | { type: 'START_GAME'; players: Omit<Player, 'money' | 'position' | 'inJail' | 'jailTurns' | 'hasGetOutOfJailCard' | 'isBankrupt' | 'properties'>[] }
    | { type: 'ROLL_DICE' }
    | { type: 'BUY_PROPERTY' }
    | { type: 'DECLINE_PROPERTY' }     // P1: elutasítás → aukció indul
    | { type: 'AUCTION_BID'; amount: number }
    | { type: 'AUCTION_PASS' }
    | { type: 'BUILD_HOUSE'; spaceId: number }
    | { type: 'BUILD_HOTEL'; spaceId: number }
    | { type: 'SELL_HOUSE'; spaceId: number }
    | { type: 'MORTGAGE_PROPERTY'; spaceId: number }
    | { type: 'UNMORTGAGE_PROPERTY'; spaceId: number }
    | { type: 'PAY_JAIL_FINE' }
    | { type: 'USE_JAIL_CARD' }
    | { type: 'TRY_JAIL_DOUBLES' }
    | { type: 'END_TURN' }
    | { type: 'DRAW_CARD'; cardType: CardType }
    | { type: 'RESOLVE_CARD' }
    | { type: 'DECLARE_BANKRUPTCY'; creditorId?: string }
    | { type: 'PROPOSE_TRADE'; offer: TradeOffer }
    | { type: 'ACCEPT_TRADE' }
    | { type: 'REJECT_TRADE' }
    | { type: 'CANCEL_TRADE' }
    | { type: 'SET_HOUSE_RULES'; rules: HouseRules }  // P2: házi szabályok
    | { type: 'ADD_LOG'; entry: Omit<LogEntry, 'id' | 'timestamp'> }
    | { type: 'SET_TOKEN_ANIM'; animState: TokenAnimState }
    | { type: 'MOVE_STEP' }
    | { type: 'MOVE_TELEPORT'; position: number; passedGo?: boolean };
