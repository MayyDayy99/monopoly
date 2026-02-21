import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../engine/GameHooks';
import { getTokenByEmoji } from './TokenRegistry';
import { recalculateAllPositions } from './tokenPositioning';

/**
 * TOKEN LAYER — AAA Mozgásmotor (Framer Motion Edition)
 * A korábbi CSS tranzíciókat Framer Motion-re cseréltük a maximális fluiditásért.
 * Ez kezeli az "Easy-In/Easy-Out" élményt és a bábuk súlyát.
 */
export function TokenLayer() {
    const { state } = useGame();

    const positions = useMemo(() => {
        return recalculateAllPositions(state.players);
    }, [state.players]);

    const activePlayers = state.players.filter(p => !p.isBankrupt);

    return (
        <div
            id="tokens-layer"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 100,
                pointerEvents: 'none',
                overflow: 'visible'
            }}
        >
            <AnimatePresence>
                {activePlayers.map(player => {
                    const pos = positions.get(player.id);
                    const tokenDef = getTokenByEmoji(player.token);
                    const TokenComponent = tokenDef.component;
                    const isCurrentPlayer = state.players[state.currentPlayerIndex]?.id === player.id;
                    const isMoving = isCurrentPlayer && state.tokenAnimState === 'MOVING';

                    if (!pos) return null;

                    return (
                        <motion.div
                            key={player.id}
                            className={`token-container ${isCurrentPlayer ? 'active-token' : ''} ${isMoving ? 'moving-token' : ''}`}
                            initial={false}
                            animate={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                // Elevation (Z-axis simulation)
                                scale: isMoving ? 1.45 : 1,
                                rotate: isMoving ? 4 : 0,
                            }}
                            transition={{
                                // AAA Fluiditás: Egy közepesen lágy rugó (Spring) biztosítja a folyamatosságot.
                                // Ha a célpont változik (MOVE_STEP), a rugó simán átvezeti a mozgást.
                                type: 'spring',
                                stiffness: 60,
                                damping: 18,
                                mass: 0.8,
                                // A scale és rotate kicsit gyorsabb lehet mint a haladás
                                scale: { duration: 0.3 },
                                rotate: { duration: 0.3 }
                            }}
                            style={{
                                position: 'absolute',
                                transform: 'translate(-50%, -50%)', // Centerezés fix marad
                                pointerEvents: 'auto',
                                zIndex: isMoving ? 200 : (isCurrentPlayer ? 150 : 110),
                                willChange: 'left, top, transform'
                            }}
                        >
                            <TokenComponent
                                size={26}
                                color={player.color}
                                isAnimating={isCurrentPlayer}
                                label={player.name}
                                tokenState={isCurrentPlayer ? state.tokenAnimState : 'IDLE'}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
