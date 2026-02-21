# Architektúra és State Management

## Technológiai Stack
- **Környezet**: React (TypeScript) + Vite.
- **Állapotkezelés**: React Context + useReducer / Zustand.
- **Stílus**: Tailwind CSS + egyedi CSS Keyframes.

## Szabályok
1. **Egyirányú adatfolyam**: A UI soha nem módosíthatja közvetlenül a State-et. Csak Action-öket küldhetsz (dispatch).
   - Példa: `dispatch({ type: 'BUY_PROPERTY', payload: spaceId })`
2. **Separation of Concerns**: Az üzleti logikát (játékszabályok) válaszd le a DOM rendereléstől.
3. **Vizuális módosítás**: Ha csak vizuális váltás történik, a State logikához TILOS hozzányúlni.
