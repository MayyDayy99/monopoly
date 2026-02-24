// ============================================================
// LORICATUS MULTIPLAYER LOBBY
// Real-time synchronization via Firebase Firestore
// #c7fe1b neon green accent, sötét technikai stílus
// ============================================================
import { useState, useEffect } from 'react';
import { auth, db } from '../engine/firebase';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useGame } from '../engine/GameHooks';
import { createInitialState } from '../engine/gameReducer';
import { motion } from 'framer-motion';
import logoKicsi from '../assets/logo_kicsi.png';
import { clearSave } from '../engine/storage';

interface LobbyProps {
    onGameJoined: (roomId: string, playerUid: string) => void;
}

export function MultiplayerLobby({ onGameJoined }: LobbyProps) {
    const { state, dispatch } = useGame();
    const [user, setUser] = useState<User | null>(null);
    const [roomIdInput, setRoomIdInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [joinedUids, setJoinedUids] = useState<string[]>([]);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        signInAnonymously(auth).catch(e => {
            console.error("[Loricatus] Auth hiba:", e);
            setError("Nem sikerült kapcsolódni a központhoz. Ellenőrizd az internetet!");
        });

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return unsubscribe;
    }, []);

    // Listen to joined players if we are already in a room
    useEffect(() => {
        if (state.roomId && user) {
            const unsubscribe = onSnapshot(doc(db, 'games', state.roomId), (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setJoinedUids(data.joinedUids || []);
                    if (data.hostId === user.uid) setIsHost(true);

                    // Ha a játék fázisa megváltozott, az App.tsx useEffectje fogja váltani a nézetet
                }
            }, (err) => {
                console.error("[Loricatus] Lobby snapshot hiba:", err);
                setError("A szoba adatai nem elérhetőek. Firestore Rules hiba?");
            });
            return unsubscribe;
        }
    }, [state.roomId, user]);

    const generateRoomId = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'LR-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const createRoom = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            console.log("[Loricatus] Létrehozás kezdődik, User UID:", user.uid);
            const newId = generateRoomId();
            const initialState = createInitialState();

            const gameData = {
                ...initialState,
                roomId: newId,
                hostId: user.uid,
                players: [],
                joinedUids: [user.uid],
                phase: 'setup',
            };

            console.log("[Loricatus] Mentés a Firestore-ba: ", newId);
            await setDoc(doc(db, 'games', newId), gameData);
            console.log("[Loricatus] Csatlakozva az új szobához");
            onGameJoined(newId, user.uid);
            setIsHost(true);
        } catch (e: any) {
            console.error("[Loricatus] Szobakészítés HIBA:", e);
            setError("Sikertelen szobakészítés: " + e.message);
        } finally {
            console.log("[Loricatus] Szobakészítés finally blokk");
            setLoading(false);
        }
    };

    const joinRoom = async () => {
        if (!user || !roomIdInput) return;
        setLoading(true);
        setError(null);
        try {
            console.log("[Loricatus] Csatlakozás szobához, id:", roomIdInput);
            const id = 'LR-' + roomIdInput.toUpperCase().trim();
            const docRef = doc(db, 'games', id);
            console.log("[Loricatus] Adatok lekérése a Firestore-ból...");
            const docSnap = await getDoc(docRef);
            console.log("[Loricatus] Adatok lekérve", docSnap.exists());

            if (!docSnap.exists()) {
                setError("A megadott küldetéskód nem létezik.");
                setLoading(false);
                return;
            }

            const data = docSnap.data();
            if (data.joinedUids && data.joinedUids.length >= 4) {
                setError("A küldetés már megtelt.");
                setLoading(false);
                return;
            }

            if (!data.joinedUids.includes(user.uid)) {
                console.log("[Loricatus] Új ügynök csatlakozik, updateDoc hívás");
                await updateDoc(docRef, {
                    joinedUids: arrayUnion(user.uid)
                });
            }

            onGameJoined(id, user.uid);
        } catch (e: any) {
            console.error("[Loricatus] Csatlakozás HIBA:", e);
            setError("Hiba a csatlakozáskor: " + e.message);
        } finally {
            console.log("[Loricatus] Csatlakozás finally blokk");
            setLoading(false);
        }
    };

    const startMission = () => {
        if (!isHost || joinedUids.length < 2) return;

        const players = joinedUids.map((uid, idx) => ({
            id: `p${idx + 1}`,
            name: uid === user?.uid ? 'Főhadiszállás (Én)' : (uid.startsWith('bot_') ? `AI Gép ${idx}` : `Ügynök ${idx + 1}`),
            color: ['#c7fe1b', '#0ea5e9', '#e879f9', '#fb923c'][idx],
            token: ['🛰️', '🚁', '📡', '🖥️'][idx],
            isBot: uid.startsWith('bot_'),
            money: 1500,
            position: 0,
            inJail: false,
            jailTurns: 0,
            hasGetOutOfJailCard: 0,
            isBankrupt: false,
            properties: [],
            uid: uid
        }));

        dispatch({ type: 'START_GAME', players });
    };

    const addBot = async () => {
        if (!state.roomId || joinedUids.length >= 4) return;
        try {
            const docRef = doc(db, 'games', state.roomId);
            await updateDoc(docRef, {
                joinedUids: arrayUnion(`bot_${Math.random().toString(36).substring(7)}`)
            });
        } catch (e) {
            console.error("[Loricatus] Bot hozzáadás hiba:", e);
        }
    };

    const leaveRoom = async () => {
        if (state.roomId && user) {
            try {
                const docRef = doc(db, 'games', state.roomId);
                await updateDoc(docRef, {
                    joinedUids: joinedUids.filter(uid => uid !== user.uid)
                });
            } catch (e) {
                console.error("[Loricatus] Kilépés hiba:", e);
            }
        }
        clearSave();
        dispatch({ type: 'SYNC_STATE', state: createInitialState() });
    };

    const startLocalGame = () => {
        clearSave();
        const players = [
            { id: 'p1', name: 'Játékos 1 (Helyi)', color: '#c7fe1b', token: '🛰️', isBot: false, money: 1500, position: 0, inJail: false, jailTurns: 0, hasGetOutOfJailCard: 0, isBankrupt: false, properties: [], uid: 'local_p1' },
            { id: 'p2', name: 'Loricatus AI (Gép)', color: '#0ea5e9', token: '🚁', isBot: true, money: 1500, position: 0, inJail: false, jailTurns: 0, hasGetOutOfJailCard: 0, isBankrupt: false, properties: [], uid: 'local_bot1' },
            { id: 'p3', name: 'Cyberbot (Gép)', color: '#e879f9', token: '📡', isBot: true, money: 1500, position: 0, inJail: false, jailTurns: 0, hasGetOutOfJailCard: 0, isBankrupt: false, properties: [], uid: 'local_bot2' }
        ];
        dispatch({ type: 'SYNC_STATE', state: createInitialState() });
        setTimeout(() => {
            dispatch({ type: 'START_GAME', players });
            onGameJoined('', 'local_p1');
        }, 100);
    };

    if (!user) {
        return (
            <div className="setup-container">
                <div className="setup-card" style={{ textAlign: 'center' }}>
                    <div className="animate-pulse" style={{ color: 'var(--neon)' }}>Kapcsolódás a Loricatus hálózathoz...</div>
                    <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ellenőrizd, hogy a Firebase Anonymous Auth engedélyezve van-e!</p>
                </div>
            </div>
        );
    }

    if (state.roomId) {
        return (
            <div className="setup-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="setup-card"
                    style={{ textAlign: 'center' }}
                >
                    <h1 className="setup-title" style={{ fontSize: '2.5rem', color: 'var(--neon)' }}>{state.roomId}</h1>
                    <p className="setup-subtitle">Küldetéskód — Oszd meg a többiekkel!</p>

                    <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {joinedUids.map((uid, idx) => (
                            <div key={idx} style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                border: `1px solid ${uid === user.uid ? 'var(--neon)' : 'var(--border)'}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                                    {idx === 0 ? '👑 HOST' : (uid.startsWith('bot_') ? `🤖 AI GÉP ${idx}` : `👤 ÜGYNÖK ${idx + 1}`)}
                                    {uid === user.uid && ' (Te)'}
                                </span>
                                <span style={{ color: 'var(--neon)', fontSize: '0.7rem' }}>KÉSZ</span>
                            </div>
                        ))}
                    </div>

                    {isHost ? (
                        <>
                            {joinedUids.length < 4 && (
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#3b82f6', border: 'none', color: '#fff' }}
                                    onClick={addBot}
                                >
                                    🤖 AI GÉP HOZZÁADÁSA
                                </button>
                            )}
                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                                disabled={joinedUids.length < 2}
                                onClick={startMission}
                            >
                                {joinedUids.length < 2 ? 'KÉT RÉSZTVEVŐ SZÜKSÉGES' : '🚀 MISSZIÓ INDÍTÁSA'}
                            </button>
                        </>
                    ) : (
                        <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            Várakozás a Host indítására...
                        </div>
                    )}

                    <button
                        className="btn-danger"
                        style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                        onClick={leaveRoom}
                    >
                        KILÉPÉS A KÜLDETÉSBŐL
                    </button>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '1rem' }}>{error}</p>}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="setup-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="setup-card"
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <img src={logoKicsi} alt="Logo" className="setup-logo" />
                    <h1 className="setup-title">Monopoly by Loricatus</h1>
                    <p className="setup-subtitle">Repül, Rögzít, Segít</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="sidebar-card">
                        <h3>Új Küldetés</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Hozz létre egy új szobát.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={createRoom}
                            disabled={loading}
                        >
                            {loading ? 'Inicializálás...' : '🚀 LÉTREHOZÁS'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>VAGY</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    <div className="sidebar-card">
                        <h3>Csatlakozás</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div className="setup-input" style={{ flex: 3, display: 'flex', alignItems: 'center', padding: '0', overflow: 'hidden' }}>
                                <span style={{ padding: '0.75rem 0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRight: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>LR-</span>
                                <input
                                    type="text"
                                    placeholder="XXXX"
                                    value={roomIdInput}
                                    onChange={(e) => setRoomIdInput(e.target.value.toUpperCase().replace(/LR-/i, ''))}
                                    style={{ flex: 1, textAlign: 'center', minWidth: 0, padding: '0.75rem 0.5rem', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
                                />
                            </div>
                            <button
                                className="btn-primary"
                                onClick={joinRoom}
                                disabled={loading || !roomIdInput}
                                style={{ flex: 1, padding: '0.75rem 0', minWidth: '80px', fontSize: '0.8rem' }}
                            >
                                {loading ? '...' : 'BELÉPÉS'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OFFLINE</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    <div className="sidebar-card">
                        <h3>Lokális Játék</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Játssz helyben a beépített intelligencia ellen!
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', background: 'var(--text-secondary)', color: '#000' }}
                            onClick={startLocalGame}
                        >
                            LOKÁLIS JÁTÉK INDÍTÁSA
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
