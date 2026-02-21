// ============================================================
// TOKEN POSITIONING UTILITY — Fizikai motor a bábu pozicionáláshoz
// Kiszámítja az X/Y pixel-koordinátákat a tábla overlay rétegéhez.
// ============================================================

/** Kiszámolt token pozíció */
export interface TokenPosition {
    x: number;
    y: number;
}

/**
 * Kiszámítja egy bábu pontos pixel-pozícióját az overlay rétegen belül.
 *
 * @param spaceIndex - A célmező indexe (0-39)
 * @param playerIndex - A játékos sorszáma az adott mezőn (ütközéselkerüléshez)
 * @param totalPlayersOnSpace - Összes játékos száma az adott mezőn
 * @param boardEl - A tokens-layer (overlay) DOM elem referenciája
 * @returns Az X/Y koordináták az overlay rétegen belül, vagy null ha a DOM elem nem található
 */
export function calculateTokenPosition(
    spaceIndex: number,
    playerIndex: number,
    totalPlayersOnSpace: number,
    boardEl: HTMLElement | null,
): TokenPosition | null {
    // Célmező DOM elem keresése data attribútum alapján
    const spaceEl = document.querySelector(`[data-space-id="${spaceIndex}"]`);
    if (!spaceEl || !boardEl) return null;

    // Bounding rect-ek lekérése
    const spaceRect = spaceEl.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();

    // Középpont kiszámítása az overlay réteghez viszonyítva
    const centerX = spaceRect.left - boardRect.left + spaceRect.width / 2;
    const centerY = spaceRect.top - boardRect.top + spaceRect.height / 2;

    // Ütközéselkerülő eltolás (Anti-Collision Offset)
    // Ha több játékos van egy mezőn, szétszórjuk őket szimmetrikusan
    let offsetX = 0;
    let offsetY = 0;

    if (totalPlayersOnSpace > 1) {
        // Szimmetrikus eltolás a középpont körül
        offsetX = (playerIndex - (totalPlayersOnSpace - 1) / 2) * 10;
        offsetY = (playerIndex - (totalPlayersOnSpace - 1) / 2) * -8;
    }

    return {
        x: centerX + offsetX,
        y: centerY + offsetY,
    };
}

/**
 * Az összes aktív (nem csődölt) játékos pozícióját újraszámolja.
 * Használd a resize event kezelésekor.
 *
 * @param players - Játékos tömb (id, position, isBankrupt)
 * @param boardEl - Az overlay réteg DOM referenciája
 * @returns Map: playerId → TokenPosition
 */
export function recalculateAllPositions(
    players: { id: string; position: number; isBankrupt: boolean }[],
    boardEl: HTMLElement | null,
): Map<string, TokenPosition> {
    const positionMap = new Map<string, TokenPosition>();

    // Csoportosítás mezők szerint (Anti-Collision)
    const spaceGroups = new Map<number, typeof players>();
    const activePlayers = players.filter(p => !p.isBankrupt);

    activePlayers.forEach(p => {
        const group = spaceGroups.get(p.position) || [];
        group.push(p);
        spaceGroups.set(p.position, group);
    });

    // Pozíciók kiszámolása
    spaceGroups.forEach((group, _spaceIndex) => {
        group.forEach((player, indexInGroup) => {
            const pos = calculateTokenPosition(
                player.position,
                indexInGroup,
                group.length,
                boardEl,
            );
            if (pos) {
                positionMap.set(player.id, pos);
            }
        });
    });

    return positionMap;
}
