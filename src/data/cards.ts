import type { GameCard } from '../types';

export const CHANCE_CARDS: GameCard[] = [
    { id: 'ch1', type: 'chance', text: 'Lépj a START mezőre! Vedd fel a 200k-t.', action: { kind: 'move-to', position: 0 } },
    { id: 'ch2', type: 'chance', text: 'Lépj az Országházhoz! Ha átlépsz a START-on, vedd fel a 200k-t.', action: { kind: 'move-to', position: 31 } },
    { id: 'ch3', type: 'chance', text: 'Lépj a Grassalkovich-kastélyhoz!', action: { kind: 'move-to', position: 14 } },
    { id: 'ch4', type: 'chance', text: 'Lépj a Fotogrammetria állomásra!', action: { kind: 'move-to', position: 5 } },
    { id: 'ch5', type: 'chance', text: 'Szálltál a No-Fly Zone-ba! Légtér-korlátozás — ne lépj át a START-on!', action: { kind: 'go-to-jail' } },
    { id: 'ch6', type: 'chance', text: 'Sikeres felmérési projekt — a megbízó 50k bónuszt fizet.', action: { kind: 'collect', amount: 50 } },
    { id: 'ch7', type: 'chance', text: 'Légtéri engedély feloldása! Tartsd meg ezt a kártyát.', action: { kind: 'get-out-of-jail' } },
    { id: 'ch8', type: 'chance', text: 'GPS-jel vesztés — menj hátra 3 mezőt!', action: { kind: 'move-back', spaces: 3 } },
    { id: 'ch9', type: 'chance', text: 'Szerver karbantartás: fizess 25k-t minden LOD szintért és 100k-t minden Digitális Ikerért.', action: { kind: 'repairs', perHouse: 25, perHotel: 100 } },
    { id: 'ch10', type: 'chance', text: 'Drón sebesség-túllépés — 15k bírság!', action: { kind: 'pay', amount: 15 } },
    { id: 'ch11', type: 'chance', text: 'Lépj az RTK Bemérés állomásra!', action: { kind: 'move-to', position: 25 } },
    { id: 'ch12', type: 'chance', text: 'Projektvezetővé választottak! Fizess minden partnernek 50k-t.', action: { kind: 'pay-each-player', amount: 50 } },
    { id: 'ch13', type: 'chance', text: 'Megnyerted a BIM-verseny fődíját: kapsz 100k-t.', action: { kind: 'collect', amount: 100 } },
    { id: 'ch14', type: 'chance', text: 'EU pályázati támogatás érkezett: 200k.', action: { kind: 'collect', amount: 200 } },
    { id: 'ch15', type: 'chance', text: 'Lépj a legközelebbi technológia állomásra!', action: { kind: 'advance-to-nearest-railroad' } },
    { id: 'ch16', type: 'chance', text: 'Lépj a legközelebbi szerverparkra!', action: { kind: 'advance-to-nearest-utility' } },
];

export const COMMUNITY_CARDS: GameCard[] = [
    { id: 'cc1', type: 'community', text: 'Lépj a START mezőre! Vedd fel a 200k-t.', action: { kind: 'move-to', position: 0 } },
    { id: 'cc2', type: 'community', text: 'Rendszerhiba a bankban a javadra: kapsz 200k-t.', action: { kind: 'collect', amount: 200 } },
    { id: 'cc3', type: 'community', text: 'Drón szerviz díj: fizess 50k-t.', action: { kind: 'pay', amount: 50 } },
    { id: 'cc4', type: 'community', text: 'Pontfelhő-értékesítésből 50k-t kapsz.', action: { kind: 'collect', amount: 50 } },
    { id: 'cc5', type: 'community', text: 'Légtéri engedély feloldása! Tartsd meg ezt a kártyát.', action: { kind: 'get-out-of-jail' } },
    { id: 'cc6', type: 'community', text: 'No-Fly Zone! Légtér-korlátozás — ne lépj át a START-on!', action: { kind: 'go-to-jail' } },
    { id: 'cc7', type: 'community', text: 'Év végi projekt bónusz: 100k-t kapsz.', action: { kind: 'collect', amount: 100 } },
    { id: 'cc8', type: 'community', text: 'Szoftver licenc visszatérítés: 20k-t kapsz.', action: { kind: 'collect', amount: 20 } },
    { id: 'cc9', type: 'community', text: 'Jubileumi ünnepség! Minden partner fizet neked 10k-t.', action: { kind: 'collect-from-each', amount: 10 } },
    { id: 'cc10', type: 'community', text: 'Drón biztosítás lejár: kapsz 100k-t.', action: { kind: 'collect', amount: 100 } },
    { id: 'cc11', type: 'community', text: 'Szkenner javítási költség: fizess 100k-t.', action: { kind: 'pay', amount: 100 } },
    { id: 'cc12', type: 'community', text: 'BIM tanfolyam díja: fizess 50k-t.', action: { kind: 'pay', amount: 50 } },
    { id: 'cc13', type: 'community', text: 'Konzultációs díj: kapsz 25k-t.', action: { kind: 'collect', amount: 25 } },
    { id: 'cc14', type: 'community', text: 'Szerver-frissítés: fizess 40k-t minden LOD szintért és 115k-t minden Digitális Ikerért.', action: { kind: 'repairs', perHouse: 40, perHotel: 115 } },
    { id: 'cc15', type: 'community', text: '3D modell verseny 2. helyezett: kapsz 10k-t.', action: { kind: 'collect', amount: 10 } },
    { id: 'cc16', type: 'community', text: 'Örokölsz egy régi téodolitot — értéke 100k.', action: { kind: 'collect', amount: 100 } },
];

export function shuffleDeck(cards: GameCard[]): GameCard[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
