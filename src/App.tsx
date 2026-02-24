// ============================================================
// LORICATUS PRIME ARCHITECT - APP ENTRY POINT (Final Fix)
// Szigorú nézet-kikényszerítés és Firebase integráció
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider } from './engine/GameContext';
import { useGame } from './engine/GameHooks';
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

// Loricatus Lobby komponens importálása
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { clearSave } from './engine/storage';
import { createInitialState } from './engine/gameReducer';

/**
 * GameContent: A fő renderelési logika a kért fokozott állapotkezeléssel.
 */
function GameContent() {
  const { state, dispatch } = useGame();

  // A felhasználó által kért változónevek használata a szigorú state-kikényszerítéshez
  const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');
  const [roomData, setRoomData] = useState<string | null>(null);

  // Bot automatizáció aktiválása
  useBotPlayer();

  // SZINKRONIZÁCIÓ: Ha a Firebase state.phase átvált (setup -> rolling), 
  // akkor váltunk át a játéktábla nézetre. Ez kezeli az oldal újratöltést is.
  useEffect(() => {
    if (state.phase !== 'setup') {
      setGameState('playing');
      setRoomData(state.roomId || null);
    } else {
      setGameState('lobby');
    }
  }, [state.phase, state.roomId]);

  // Csatlakozás eseménykezelő
  const handleGameJoined = useCallback((roomId: string) => {
    if (roomId) {
      console.log(`[Loricatus] Küldetés kód rögzítve: ${roomId}`);
      dispatch({ type: 'SYNC_STATE', state: { ...state, roomId } });
    } else {
      console.log(`[Loricatus] Lokális játék indítása`);
    }
    setRoomData(roomId || null);
  }, [dispatch, state]);

  return (
    <div
      id="app-container"
      data-room-id={roomData}
      style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}
    >

      {/* ── 1. NÉZET: VÁRÓTEREM (LOBBY) ── */}
      {gameState === 'lobby' && (
        <MultiplayerLobby onGameJoined={handleGameJoined} />
      )}

      {/* ── 2. NÉZET: JÁTÉKTÁBLA (PLAYING) ── */}
      {gameState === 'playing' && (
        <>
          <div className="game-layout">
            <aside className="loricatus-hud">
              <LoricatusHUD />
              <div className="hud-scroll-content">
                <PlayerStats />
                <div className="sidebar-card">
                  <h3>🏘️ Ingatlanjaim</h3>
                  <PlayerInventory />
                </div>
                <CollapsibleEventLog />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingBottom: '2rem', gap: '0.5rem', flexDirection: 'column', alignItems: 'center' }}>
                  <HouseRulesPanel />
                  <LeaveGameButton />
                </div>
              </div>
            </aside>

            <main className="game-board-section">
              <Board />
            </main>
          </div>

          <WinnerScreen />
          <AuctionPanel />
          <TradeResponseModal />
          <DebugPanel />
        </>
      )}
    </div>
  );
}

// --- SEGÉDKOMPONENSEK ---

function CollapsibleEventLog() {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const lastLog = state.logs[state.logs.length - 1];

  return (
    <div className="sidebar-card">
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
      >
        <h3 style={{ margin: 0 }}>📋 Napló</h3>
        {!isOpen && lastLog && (
          <AnimatePresence mode="wait">
            <motion.div
              key={lastLog.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingLeft: '0.4rem',
                borderLeft: '1px solid var(--border-muted)',
                flex: 1
              }}
            >
              {lastLog.message}
            </motion.div>
          </AnimatePresence>
        )}
        <span style={{ color: 'var(--neon)', marginLeft: 'auto', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>
      {isOpen && <div style={{ marginTop: '0.75rem' }}><EventLog /></div>}
    </div>
  );
}

function LeaveGameButton() {
  const { dispatch } = useGame();

  const handleLeave = () => {
    if (confirm('Biztosan ki akarsz lépni a játékból? A jelenlegi állapotod törlődik.')) {
      clearSave();
      dispatch({ type: 'SYNC_STATE', state: createInitialState() });
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleLeave}
      style={{
        background: 'transparent',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '0.3rem 0.6rem',
        borderRadius: '8px',
        fontSize: '0.75rem',
        cursor: 'pointer',
      }}
    >
      🚪 Kilépés a játékból
    </button>
  );
}

function PlayerInventory() {
  const { state } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer) return null;

  if (currentPlayer.properties.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>Üres.</div>;
  }

  const grouped: Record<string, number[]> = {};
  currentPlayer.properties.forEach((sid: number) => {
    const space = BOARD_SPACES[sid];
    if (!space) return;
    const group = space.property?.colorGroup || space.type || 'other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(sid);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {Object.entries(grouped).map(([group, sids]) => {
        const groupColor = COLOR_GROUP_COLORS[group as ColorGroup] || '#888';
        const isCompleteGroup = COLOR_GROUPS[group]
          ? COLOR_GROUPS[group].every(sid => currentPlayer.properties.includes(sid))
          : false;

        return (
          <div key={group}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '1px', background: groupColor }} />
              <span style={{ fontSize: '0.65rem', fontWeight: isCompleteGroup ? 700 : 400 }}>{group}</span>
            </div>
            {sids.map(sid => (
              <div key={sid} style={{ fontSize: '0.7rem', paddingLeft: '0.8rem', opacity: state.ownedProperties[sid]?.isMortgaged ? 0.5 : 1 }}>
                {BOARD_SPACES[sid].name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// --- ENTRY ---

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
