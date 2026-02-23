import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider } from './engine/GameContext';
import { useGame } from './engine/GameHooks';
import { PlayerSetup } from './components/PlayerSetup';
import { Board } from './components/Board';
import { PlayerStats } from './components/PlayerStats';
import { WinnerScreen } from './components/WinnerScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DebugPanel } from './components/DebugPanel';
import { AuctionPanel } from './components/AuctionPanel';
import { TradeResponseModal } from './components/TradeModal';
import { HouseRulesPanel } from './components/HouseRulesPanel';
import { LoricatusHUD } from './components/LoricatusHUD';
import { EventLog } from './components/EventLog';
import { OrientationOverlay } from './components/OrientationOverlay';
import { useBotPlayer } from './engine/useBotPlayer';
import { BOARD_SPACES, COLOR_GROUP_COLORS, COLOR_GROUPS } from './data/board';
import type { ColorGroup } from './types';
import { clearSave, hasSavedGame } from './engine/storage';

import { MultiplayerLobby } from './components/MultiplayerLobby';

function GameContent() {
  const { state, dispatch, localUid } = useGame();
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  // P2: Auto-play bot turns (#73)
  useBotPlayer();

  const handleStart = useCallback((players: { id: string; name: string; color: string; token: string; isBot: boolean }[]) => {
    // Add UID to the local player if it's a multiplayer game
    const playersWithUid = players.map((p, idx) => {
      if (isMultiplayer && idx === 0 && localUid) {
        return { ...p, uid: localUid };
      }
      return p;
    });
    dispatch({ type: 'START_GAME', players: playersWithUid });
  }, [dispatch, isMultiplayer, localUid]);

  const handleGameJoined = useCallback((roomId: string) => {
    dispatch({ type: 'SYNC_STATE', state: { ...state, roomId } });
    setIsMultiplayer(true);
  }, [dispatch, state]);

  // Ha még nincs szoba kiválasztva és nem mentett játékkal indulunk,
  // akkor választási lehetőséget adunk: Single vagy Multi
  if (state.phase === 'setup' && !state.roomId && !isMultiplayer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PlayerSetup onStart={handleStart} onMultiplayerClick={() => setIsMultiplayer(true)} />
      </div>
    );
  }

  // Lobby fázis a Firebase-hez
  if (isMultiplayer && state.phase === 'setup' && state.roomId) {
    return <MultiplayerLobby onGameJoined={handleGameJoined} />;
  }

  return (
    <>
      <div className="game-layout">
        {/* ── BAL OLDAL: LORICATUS VEZÉRLŐPULT (400px) ── */}
        <aside className="loricatus-hud">
          <LoricatusHUD />

          <div className="hud-scroll-content">
            <PlayerStats />

            <div className="sidebar-card">
              <h3>🏘️ Ingatlanjaim</h3>
              <PlayerInventory />
            </div>

            <CollapsibleEventLog />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingBottom: '2rem' }}>
              <HouseRulesPanel />
            </div>
          </div>

          <ResumeBar />
        </aside>

        {/* ── JOBB OLDAL: DINAMIKUS TÁBLA KONTÉNER ── */}
        <main className="game-board-section">
          <Board />
        </main>
      </div>

      <WinnerScreen />
      <AuctionPanel />
      <TradeResponseModal />
      <DebugPanel />
    </>
  );
}

function CollapsibleEventLog() {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const lastLog = state.logs[state.logs.length - 1];

  return (
    <div className="sidebar-card">
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>📋 Napló</h3>
        {!isOpen && lastLog && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              key={lastLog.id}
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                fontFamily: "'JetBrains Mono', monospace",
                borderLeft: '1px solid var(--border-muted)',
                paddingLeft: '0.5rem'
              }}
            >
              {lastLog.message}
            </motion.div>
          </AnimatePresence>
        )}
        <span style={{
          fontSize: '0.8rem',
          color: 'var(--neon)',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          marginLeft: 'auto'
        }}>
          ▼
        </span>
      </div>
      {isOpen && (
        <div style={{ marginTop: '0.75rem' }}>
          <EventLog />
        </div>
      )}
    </div>
  );
}

function PlayerInventory() {
  const { state } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  if (currentPlayer.properties.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
        Még nincs ingatlanod.
      </div>
    );
  }

  // Group properties by color group (#48)
  const grouped: Record<string, number[]> = {};
  currentPlayer.properties.forEach((sid: number) => {
    const space = BOARD_SPACES[sid];
    if (!space) return;
    const group = space.property?.colorGroup || space.type || 'other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(sid);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Object.entries(grouped).map(([group, sids]) => {
        const groupColor = COLOR_GROUP_COLORS[group as ColorGroup] || '#888';
        const isCompleteGroup = COLOR_GROUPS[group]
          ? COLOR_GROUPS[group].every(sid => currentPlayer.properties.includes(sid))
          : false;

        return (
          <div key={group}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.2rem',
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: groupColor,
              }} />
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: isCompleteGroup ? 700 : 400,
              }}>
                {group}
                {isCompleteGroup && ' ★'}
              </span>
            </div>
            {sids.map(sid => {
              const space = BOARD_SPACES[sid];
              const owned = state.ownedProperties[sid];
              return (
                <div
                  key={sid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.2rem 0.4rem',
                    paddingLeft: '0.8rem',
                    fontSize: '0.72rem',
                    opacity: owned?.isMortgaged ? 0.5 : 1,
                  }}
                >
                  <span style={{ flex: 1, fontWeight: 500 }}>{space.name}</span>
                  {owned?.hasHotel && <span>🏨</span>}
                  {!owned?.hasHotel && owned && owned.houses > 0 && <span>🏠×{owned.houses}</span>}
                  {owned?.isMortgaged && <span style={{ color: '#f87171', fontSize: '0.6rem' }}>JLZ</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameWrapper />
      </GameProvider>
    </ErrorBoundary>
  );
}

function GameWrapper() {
  const { state } = useGame();
  const gameStarted = state.phase !== 'setup';

  return (
    <>
      <OrientationOverlay gameStarted={gameStarted} />
      <GameContent />
    </>
  );
}

/** Shows a "continue game" bar if there's a saved game on fresh load */
function ResumeBar() {
  // This only runs once at mount — if there's a saved game it was auto-loaded by context
  // We show a discard option
  const saved = hasSavedGame();
  if (!saved) return null;

  return (
    <div className="resume-bar">
      <span className="resume-text">💾 Mentett játék betöltve</span>
      <button
        className="resume-btn"
        onClick={() => { clearSave(); window.location.reload(); }}
      >
        🗑️ Új játék
      </button>
    </div>
  );
}
