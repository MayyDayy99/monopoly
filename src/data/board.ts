// ============================================================
// Monopoly by Loricatus BOARD DATA — 40 Magyar Műemlék & Tech Mező
// "Digitalizáld a múltat, építsd a jövőt!"
// ============================================================
import type { BoardSpace } from '../types';

export const BOARD_SPACES: BoardSpace[] = [
    // ===== BOTTOM ROW (0-10, right to left visually) =====
    {
        id: 0, name: 'START', type: 'go',
    },
    {
        id: 1, name: 'Zsámbéki Romtemplom', type: 'property',
        property: { colorGroup: 'brown', price: 60, rentBase: 2, rent1H: 10, rent2H: 30, rent3H: 90, rent4H: 160, rentHotel: 250, houseCost: 50, mortgageValue: 30 },
    },
    {
        id: 2, name: 'Közösségi Alap', type: 'community',
    },
    {
        id: 3, name: 'Somogyvári Apátság', type: 'property',
        property: { colorGroup: 'brown', price: 60, rentBase: 4, rent1H: 20, rent2H: 60, rent3H: 180, rent4H: 320, rentHotel: 450, houseCost: 50, mortgageValue: 30 },
    },
    {
        id: 4, name: 'Légtérhasználati Engedély', type: 'tax',
        tax: { amount: 200 },
    },
    {
        id: 5, name: 'Fotogrammetria', type: 'railroad',
        railroad: { price: 200, mortgageValue: 100 },
    },
    {
        id: 6, name: 'Szigligeti Vár', type: 'property',
        property: { colorGroup: 'lightblue', price: 100, rentBase: 6, rent1H: 30, rent2H: 90, rent3H: 270, rent4H: 400, rentHotel: 550, houseCost: 50, mortgageValue: 50 },
    },
    {
        id: 7, name: 'Esély', type: 'chance',
    },
    {
        id: 8, name: 'Cseszneki Vár', type: 'property',
        property: { colorGroup: 'lightblue', price: 100, rentBase: 6, rent1H: 30, rent2H: 90, rent3H: 270, rent4H: 400, rentHotel: 550, houseCost: 50, mortgageValue: 50 },
    },
    {
        id: 9, name: 'Kinizsi Vár', type: 'property',
        property: { colorGroup: 'lightblue', price: 120, rentBase: 8, rent1H: 40, rent2H: 100, rent3H: 300, rent4H: 450, rentHotel: 600, houseCost: 50, mortgageValue: 60 },
    },
    {
        id: 10, name: 'No-Fly Zone', type: 'jail',
    },

    // ===== LEFT COLUMN (11-19, bottom to top) =====
    {
        id: 11, name: 'Festetics-kastély', type: 'property',
        property: { colorGroup: 'pink', price: 140, rentBase: 10, rent1H: 50, rent2H: 150, rent3H: 450, rent4H: 625, rentHotel: 750, houseCost: 100, mortgageValue: 70 },
    },
    {
        id: 12, name: 'Műholdas Kapcsolat', type: 'utility',
        utility: { price: 150, mortgageValue: 75 },
    },
    {
        id: 13, name: 'Esterházy-kastély', type: 'property',
        property: { colorGroup: 'pink', price: 140, rentBase: 10, rent1H: 50, rent2H: 150, rent3H: 450, rent4H: 625, rentHotel: 750, houseCost: 100, mortgageValue: 70 },
    },
    {
        id: 14, name: 'Grassalkovich-kastély', type: 'property',
        property: { colorGroup: 'pink', price: 160, rentBase: 12, rent1H: 60, rent2H: 180, rent3H: 500, rent4H: 700, rentHotel: 900, houseCost: 100, mortgageValue: 80 },
    },
    {
        id: 15, name: '3D Lézerszkennelés', type: 'railroad',
        railroad: { price: 200, mortgageValue: 100 },
    },
    {
        id: 16, name: 'Vajdahunyad Vára', type: 'property',
        property: { colorGroup: 'orange', price: 180, rentBase: 14, rent1H: 70, rent2H: 200, rent3H: 550, rent4H: 750, rentHotel: 950, houseCost: 100, mortgageValue: 90 },
    },
    {
        id: 17, name: 'Közösségi Alap', type: 'community',
    },
    {
        id: 18, name: 'Halászbástya', type: 'property',
        property: { colorGroup: 'orange', price: 180, rentBase: 14, rent1H: 70, rent2H: 200, rent3H: 550, rent4H: 750, rentHotel: 950, houseCost: 100, mortgageValue: 90 },
    },
    {
        id: 19, name: 'Citadella', type: 'property',
        property: { colorGroup: 'orange', price: 200, rentBase: 16, rent1H: 80, rent2H: 220, rent3H: 600, rent4H: 800, rentHotel: 1000, houseCost: 100, mortgageValue: 100 },
    },

    // ===== TOP ROW (20-30, left to right) =====
    {
        id: 20, name: 'Szabad Parkolás', type: 'free-parking',
    },
    {
        id: 21, name: 'Egri Vár', type: 'property',
        property: { colorGroup: 'red', price: 220, rentBase: 18, rent1H: 90, rent2H: 250, rent3H: 700, rent4H: 875, rentHotel: 1050, houseCost: 150, mortgageValue: 110 },
    },
    {
        id: 22, name: 'Esély', type: 'chance',
    },
    {
        id: 23, name: 'Visegrádi Fellegvár', type: 'property',
        property: { colorGroup: 'red', price: 220, rentBase: 18, rent1H: 90, rent2H: 250, rent3H: 700, rent4H: 875, rentHotel: 1050, houseCost: 150, mortgageValue: 110 },
    },
    {
        id: 24, name: 'Diósgyőri Vár', type: 'property',
        property: { colorGroup: 'red', price: 240, rentBase: 20, rent1H: 100, rent2H: 300, rent3H: 750, rent4H: 925, rentHotel: 1100, houseCost: 150, mortgageValue: 120 },
    },
    {
        id: 25, name: 'RTK Bemérés', type: 'railroad',
        railroad: { price: 200, mortgageValue: 100 },
    },
    {
        id: 26, name: 'Esztergomi Bazilika', type: 'property',
        property: { colorGroup: 'yellow', price: 260, rentBase: 22, rent1H: 110, rent2H: 330, rent3H: 800, rent4H: 975, rentHotel: 1150, houseCost: 150, mortgageValue: 130 },
    },
    {
        id: 27, name: 'Szegedi Dóm', type: 'property',
        property: { colorGroup: 'yellow', price: 260, rentBase: 22, rent1H: 110, rent2H: 330, rent3H: 800, rent4H: 975, rentHotel: 1150, houseCost: 150, mortgageValue: 130 },
    },
    {
        id: 28, name: 'Központi Szerverpark', type: 'utility',
        utility: { price: 150, mortgageValue: 75 },
    },
    {
        id: 29, name: 'Mátyás-templom', type: 'property',
        property: { colorGroup: 'yellow', price: 280, rentBase: 24, rent1H: 120, rent2H: 360, rent3H: 850, rent4H: 1025, rentHotel: 1200, houseCost: 150, mortgageValue: 140 },
    },
    {
        id: 30, name: 'No-Fly Zone!', type: 'go-to-jail',
    },

    // ===== RIGHT COLUMN (31-39, top to bottom) =====
    {
        id: 31, name: 'Országház', type: 'property',
        property: { colorGroup: 'green', price: 300, rentBase: 26, rent1H: 130, rent2H: 390, rent3H: 900, rent4H: 1100, rentHotel: 1275, houseCost: 200, mortgageValue: 150 },
    },
    {
        id: 32, name: 'Hősök tere', type: 'property',
        property: { colorGroup: 'green', price: 300, rentBase: 26, rent1H: 130, rent2H: 390, rent3H: 900, rent4H: 1100, rentHotel: 1275, houseCost: 200, mortgageValue: 150 },
    },
    {
        id: 33, name: 'Közösségi Alap', type: 'community',
    },
    {
        id: 34, name: 'Szent István Bazilika', type: 'property',
        property: { colorGroup: 'green', price: 320, rentBase: 28, rent1H: 150, rent2H: 450, rent3H: 1000, rent4H: 1200, rentHotel: 1400, houseCost: 200, mortgageValue: 160 },
    },
    {
        id: 35, name: 'BIM Modellezés', type: 'railroad',
        railroad: { price: 200, mortgageValue: 100 },
    },
    {
        id: 36, name: 'Esély', type: 'chance',
    },
    {
        id: 37, name: 'Karmelita Kolostor', type: 'property',
        property: { colorGroup: 'darkblue', price: 350, rentBase: 35, rent1H: 175, rent2H: 500, rent3H: 1100, rent4H: 1300, rentHotel: 1500, houseCost: 200, mortgageValue: 175 },
    },
    {
        id: 38, name: 'Szoftver Licenc', type: 'tax',
        tax: { amount: 100 },
    },
    {
        id: 39, name: 'Budavári Palota', type: 'property',
        property: { colorGroup: 'darkblue', price: 400, rentBase: 50, rent1H: 200, rent2H: 600, rent3H: 1400, rent4H: 1700, rentHotel: 2000, houseCost: 200, mortgageValue: 200 },
    },
];

// ---- Color Group UI Mapping ----
export const COLOR_GROUP_COLORS: Record<string, string> = {
    brown: '#78350f',
    lightblue: '#38bdf8',
    pink: '#e879f9',
    orange: '#fb923c',
    red: '#ef4444',
    yellow: '#facc15',
    green: '#22c55e',
    darkblue: '#3b82f6',
};

// ---- Color Group Monograms (For Colorblind Mode #89) ----
export const COLOR_GROUP_MONOGRAMS: Record<string, string> = {
    brown: 'BA',
    lightblue: 'VK',
    pink: 'RÓ',
    orange: 'NA',
    red: 'PI',
    yellow: 'SÁ',
    green: 'ZÖ',
    darkblue: 'SK',
};

// ---- Color Group Members ----
export const COLOR_GROUPS: Record<string, number[]> = {
    brown: [1, 3],
    lightblue: [6, 8, 9],
    pink: [11, 13, 14],
    orange: [16, 18, 19],
    red: [21, 23, 24],
    yellow: [26, 27, 29],
    green: [31, 32, 34],
    darkblue: [37, 39],
};

export const RAILROAD_IDS = [5, 15, 25, 35];
export const UTILITY_IDS = [12, 28];

export const STARTING_MONEY = 1500;
export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const MAX_HOUSES = 32;
export const MAX_HOTELS = 12;
