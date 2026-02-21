import type { GameCard } from '../types';

export const CHANCE_CARDS: GameCard[] = [
    { id: 'ch1', type: 'chance', text: 'Lépj a START mezőre! Vedd fel a 200k-t.', action: { kind: 'move-to', position: 0 } },
    { id: 'ch2', type: 'chance', text: 'Lépj az Andrássy útra!', action: { kind: 'move-to', position: 31 } },
    { id: 'ch3', type: 'chance', text: 'Lépj a Bem József térre!', action: { kind: 'move-to', position: 14 } },
    { id: 'ch4', type: 'chance', text: 'Lépj a Keleti pályaudvarra!', action: { kind: 'move-to', position: 5 } },
    { id: 'ch5', type: 'chance', text: 'Menj a börtönbe! Ne lépj át a START mezőn!', action: { kind: 'go-to-jail' } },
    { id: 'ch6', type: 'chance', text: 'A bank 50k osztalékot fizet neked.', action: { kind: 'collect', amount: 50 } },
    { id: 'ch7', type: 'chance', text: 'Ingyen szabadulsz a börtönből! Tartsd meg ezt a kártyát.', action: { kind: 'get-out-of-jail' } },
    { id: 'ch8', type: 'chance', text: 'Menj hátra 3 mezőt!', action: { kind: 'move-back', spaces: 3 } },
    { id: 'ch9', type: 'chance', text: 'Általános javítások: fizess 25k-t minden házad és 100k-t minden szállodád után.', action: { kind: 'repairs', perHouse: 25, perHotel: 100 } },
    { id: 'ch10', type: 'chance', text: 'Gyorshajtásért 15k bírságot fizetsz.', action: { kind: 'pay', amount: 15 } },
    { id: 'ch11', type: 'chance', text: 'Lépj a Déli pályaudvarra!', action: { kind: 'move-to', position: 25 } },
    { id: 'ch12', type: 'chance', text: 'Elnökké választottak! Fizess minden játékosnak 50k-t.', action: { kind: 'pay-each-player', amount: 50 } },
    { id: 'ch13', type: 'chance', text: 'Megnyerted a keresztrejtvénypályázatot: kapsz 100k-t.', action: { kind: 'collect', amount: 100 } },
    { id: 'ch14', type: 'chance', text: 'A bank tévedésből 200k-t utalt neked.', action: { kind: 'collect', amount: 200 } },
    { id: 'ch15', type: 'chance', text: 'Lépj a legközelebbi vasútállomásra!', action: { kind: 'advance-to-nearest-railroad' } },
    { id: 'ch16', type: 'chance', text: 'Lépj a legközelebbi közműre!', action: { kind: 'advance-to-nearest-utility' } },
];

export const COMMUNITY_CARDS: GameCard[] = [
    { id: 'cc1', type: 'community', text: 'Lépj a START mezőre! Vedd fel a 200k-t.', action: { kind: 'move-to', position: 0 } },
    { id: 'cc2', type: 'community', text: 'Banki hiba a javadra: kapsz 200k-t.', action: { kind: 'collect', amount: 200 } },
    { id: 'cc3', type: 'community', text: 'Orvosi díj: fizess 50k-t.', action: { kind: 'pay', amount: 50 } },
    { id: 'cc4', type: 'community', text: 'Részvényeladásból 50k-t kapsz.', action: { kind: 'collect', amount: 50 } },
    { id: 'cc5', type: 'community', text: 'Ingyen szabadulsz a börtönből! Tartsd meg ezt a kártyát.', action: { kind: 'get-out-of-jail' } },
    { id: 'cc6', type: 'community', text: 'Menj a börtönbe! Ne lépj át a START mezőn!', action: { kind: 'go-to-jail' } },
    { id: 'cc7', type: 'community', text: 'Karácsonyi bónusz: 100k-t kapsz.', action: { kind: 'collect', amount: 100 } },
    { id: 'cc8', type: 'community', text: 'Jövedelemadó-visszatérítés: 20k-t kapsz.', action: { kind: 'collect', amount: 20 } },
    { id: 'cc9', type: 'community', text: 'A születésnapod van! Minden játékos fizet neked 10k-t.', action: { kind: 'collect-from-each', amount: 10 } },
    { id: 'cc10', type: 'community', text: 'Életbiztosítás lejár: kapsz 100k-t.', action: { kind: 'collect', amount: 100 } },
    { id: 'cc11', type: 'community', text: 'Kórházi díj: fizess 100k-t.', action: { kind: 'pay', amount: 100 } },
    { id: 'cc12', type: 'community', text: 'Iskolai tandíj: fizess 50k-t.', action: { kind: 'pay', amount: 50 } },
    { id: 'cc13', type: 'community', text: 'Tanácsadói díj: kapsz 25k-t.', action: { kind: 'collect', amount: 25 } },
    { id: 'cc14', type: 'community', text: 'Utcajavítások: fizess 40k-t minden házad és 115k-t minden szállodád után.', action: { kind: 'repairs', perHouse: 40, perHotel: 115 } },
    { id: 'cc15', type: 'community', text: 'Szépségverseny második helyezettje: 10k-t kapsz.', action: { kind: 'collect', amount: 10 } },
    { id: 'cc16', type: 'community', text: 'Örökölsz 100k-t.', action: { kind: 'collect', amount: 100 } },
];

export function shuffleDeck(cards: GameCard[]): GameCard[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
