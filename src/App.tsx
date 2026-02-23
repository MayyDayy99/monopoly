// ============================================================
// LORICATUS PRIME ARCHITECT - APP ENTRY POINT
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
import { clearSave, hasSavedGame } from './engine/storage';

// Firebase modul és Lobby importálása
import { MultiplayerLobby } from './components/MultiplayerLobby';

/**
 * GameContent: A fő renderelési logika, amely kezeli a Lobby és Board közötti váltást.
 */
function GameContent() {
  const { state, dispatch } = useGame();

  // Szigorú React State kikényszerítés a nézetváltáshoz
  const [viewState, setViewState] = useState<'lobby' | 'playing'>('lobby');
  const [roomData, setRoomData] = useState<string | null>(null);

  // Bot logika aktiválása
  useBotPlayer();

  // Szinkronizáció: Ha a játék már tart (pl. frissítés után), ugorjunk a board-ra
  useEffect(() => {
    if (state.phase !== 'setup' && state.roomId) {
      setViewState('playing');
      setRoomData(state.roomId);
    }
  }, [state.phase, state.roomId]);

  // Csatlakozás eseménykezelő
  const handleGameJoined = useCallback((roomId: string, playerUid: string) => {
    console.log(`[Loricatus] Csatlakozva a szobához: ${roomId}`);
    setRoomData(roomId);
    dispatch({ type: 'SYNC_STATE', state: { ...state, roomId } });
    // Megjegyzés: A tényleges váltást a state.phase váltása fogja triggerelni a START_GAME után a useEffect-ben.
  }, [dispatch, state]);

  return (
    <div id="app-container" style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>

      {/* 1. LOBBY (Váróterem) FÁZIS */}
      {viewState === 'lobby' && (
        <MultiplayerLobby onGameJoined={handleGameJoined} />
      )}

      {/* 2. PLAYING (Játéktábla) FÁZIS */}
      {viewState === 'playing' && (
        <>
          <div className="game-layout">
            {/* ── BAL OLDAL: LORICATUS VEZÉRLŐPULT ── */}
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

            {/* ── JOBB OLDAL: DINAMIKUS TÁBLA ── */}
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

// --- SEGÉDKOMPONENSEK (NAPLÓ, INVENTÁR, STB.) ---

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
                paddingLeft: '0.5rem',
                borderLeft: '1px solid var(--border-muted)'
              }}
            >
              {lastLog.message}
            </motion.div>
          </AnimatePresence>
        )}
        <span style={{
          color: 'var(--neon)',
          marginLeft: 'auto',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </div>
      {isOpen && <div style={{ marginTop: '0.75rem' }}><EventLog /></div>}
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

// --- FŐ BELÉPÉSI PONT ---

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

function ResumeBar() {
  const saved = hasSavedGame();
  if (!saved) return null;
  return (
    <div className="resume-bar">
      <span className="resume-text">💾 Mentett játék</span>
      <button
        className="resume-btn"
        onClick={() => { clearSave(); window.location.reload(); }}
      >
        🗑️ Új misszió
      </button>
    </div>
  );
}
