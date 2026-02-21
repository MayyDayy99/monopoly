# Eseménykezelés és Collision

## Resize Handling (Window Resize)
Mivel a koordináták a képernyőn elfoglalt helytől függenek (rect), átméretezéskor minden bábunak újra kell pozicionálnia magát.
- Implementálj egy `recalculatePositions` függvényt, ami lefut a `resize` eseményre (vagy React `useEffect`-ből figyelve).

## Anti-Collision (Ütközéselkerülés)
Ha több játékos tartózkodik ugyanazon a mezőn, ne takarják el egymást.

### Geometriai Eltolás (Offset)
Alkalmazz egy apró eltolást a játékos indexe alapján a kiszámolt középponthoz képest:
- `finalX = centerX + (playerIndex * 12)px`
- `finalY = centerY + (playerIndex * -12)px`

Ez biztosítja, hogy minden bábu (pl. a Drón és a Szkenner) jól kivehető maradjon még akkor is, ha egy mezőre zsúfolódnak.
