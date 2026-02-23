import { createContext } from 'react';
import type { GameState, GameAction } from '../types';

export interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    localUid?: string | null;
}

export const GameContext = createContext<GameContextType | null>(null);
