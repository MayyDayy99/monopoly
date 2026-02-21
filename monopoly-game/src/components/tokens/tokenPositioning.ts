// ============================================================
// TOKEN POSITIONING UTILITY — Matematikai alapú pozicionálás
// Kizárja a DOM-alapú query-ket (0,0 ugrás fix)
// ============================================================

export interface TokenPosition {
    x: number; // Százalékos koordináta (0-100)
    y: number; // Százalékos koordináta (0-100)
}

/**
 * Kiszámítja a mező rács-koordinátáit (1-11)
 */
export function getGridCoords(index: number): { row: number; col: number } {
    if (index <= 10) return { row: 11, col: 11 - index };
    if (index <= 19) return { row: 10 - (index - 11), col: 1 };
    if (index <= 30) return { row: 1, col: index - 19 };
    return { row: index - 29, col: 11 };
}

/**
 * Százalékos pozíció számítása a tábla területén belül.
 * Ez IMMUNIS a DOM renderelési késleltetésre.
 */
export function calculateTokenPosition(
    spaceIndex: number,
    playerIndex: number,
    totalPlayersOnSpace: number
): TokenPosition {
    const { row, col } = getGridCoords(spaceIndex);

    // Alaphelyzet: a 11x11-es rács cellájának közepe
    // Egy cella szélessége: 100% / 11 ~ 9.09%
    const cellSize = 100 / 11;
    let x = (col - 1 + 0.5) * cellSize;
    let y = (row - 1 + 0.5) * cellSize;

    // AAA Anti-Collision: Pixel helyett %-os eltolás
    if (totalPlayersOnSpace > 1) {
        const offsetStep = 1.2; // ~1.2% eltolás
        x += (playerIndex - (totalPlayersOnSpace - 1) / 2) * offsetStep;
        y += (playerIndex - (totalPlayersOnSpace - 1) / 2) * -offsetStep;
    }

    return { x, y };
}

export function recalculateAllPositions(
    players: { id: string; position: number; isBankrupt: boolean }[]
): Map<string, TokenPosition> {
    const positionMap = new Map<string, TokenPosition>();
    const activePlayers = players.filter(p => !p.isBankrupt);

    // Csoportosítás mezők szerint
    const spaceGroups = new Map<number, typeof players>();
    activePlayers.forEach(p => {
        const group = spaceGroups.get(p.position) || [];
        group.push(p);
        spaceGroups.set(p.position, group);
    });

    activePlayers.forEach(player => {
        const group = spaceGroups.get(player.position)!;
        const indexInGroup = group.findIndex(p => p.id === player.id);

        positionMap.set(player.id, calculateTokenPosition(
            player.position,
            indexInGroup,
            group.length
        ));
    });

    return positionMap;
}
