import { useState, useCallback, useRef, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db, FIREBASE_CONFIGURED } from "./firebase";
import "./index.css";

// ─── Helpers de fecha ──────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// ─── Tipos ─────────────────────────────────────────────────────────────────
type Screen = "loading" | "login" | "classroom" | "game" | "minigame" | "vagoneta" | "victory";

interface UserDoc {
  nombre: string;
  correo: string;
  aula: string;
  saldo: number;
  racha: number;
  ultimaMision: string | null;
}

interface RoomObject {
  id: number;
  emoji: string;
  x: number;
  y: number;
  cleaned: boolean;
  rotation: number;
  scale: number;
}

// ─── Habitaciones ─────────────────────────────────────────────────────────
const ROOM_CONFIGS = [
  {
    name: "Tu Cuarto",
    bg: "linear-gradient(160deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)",
    floorColor: "#93c5fd",
    objects: ["📄", "👕", "🧸", "🧦", "📚", "🎮", "👟"],
    count: 7,
  },
  {
    name: "La Sala",
    bg: "linear-gradient(160deg, #fef9c3 0%, #fde68a 40%, #fbbf24 100%)",
    floorColor: "#fbbf24",
    objects: ["🍕", "🥤", "📰", "🎒", "🧃", "🍿", "🧢"],
    count: 8,
  },
  {
    name: "La Cocina",
    bg: "linear-gradient(160deg, #dcfce7 0%, #bbf7d0 40%, #86efac 100%)",
    floorColor: "#86efac",
    objects: ["🥄", "🍳", "🧻", "🫙", "🍱", "🥢", "🧹"],
    count: 9,
  },
];

function generateObjects(config: (typeof ROOM_CONFIGS)[0], round: number): RoomObject[] {
  const objs: RoomObject[] = [];
  const used: { x: number; y: number }[] = [];
  for (let i = 0; i < config.count + round; i++) {
    let x = 0, y = 0, attempts = 0;
    do {
      x = 8 + Math.random() * 72;
      y = 20 + Math.random() * 55;
      attempts++;
    } while (
      attempts < 30 &&
      used.some((p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 8)
    );
    used.push({ x, y });
    objs.push({
      id: i,
      emoji: config.objects[i % config.objects.length],
      x, y,
      cleaned: false,
      rotation: Math.random() * 60 - 30,
      scale: 0.8 + Math.random() * 0.5,
    });
  }
  return objs;
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Cargando
// ═══════════════════════════════════════════════════════════════════════════
function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="screen-bg flex items-center justify-center min-h-screen">
      <div className="text-center animate-fade-in-up">
        <div className="text-5xl mb-4" style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</div>
        <p className="text-gray-500 font-medium mt-3">{message ?? "Cargando..."}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Login
// ═══════════════════════════════════════════════════════════════════════════
function LoginScreen({
  onLogin,
  loading,
  error,
}: {
  onLogin: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up text-center">
        <div className="text-7xl mb-5">🏦</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Simulador de<br />
          <span className="text-indigo-600">Finanzas Personales</span>
        </h1>
        <p className="mt-3 text-gray-500 text-sm">
          Aprende a tomar decisiones financieras inteligentes jugando con tu salón.
        </p>

        <div className="my-6 border-t border-gray-100" />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn-google w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-base cursor-pointer disabled:opacity-60"
          onClick={onLogin}
          disabled={loading}
        >
          {loading ? (
            <span>⚙️</span>
          ) : (
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
          )}
          {loading ? "Iniciando sesión..." : "🔑 Iniciar Sesión con Google"}
        </button>

        <p className="mt-6 text-xs text-gray-400">Proyecto escolar · Educación financiera</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Aula
// ═══════════════════════════════════════════════════════════════════════════
function ClassroomScreen({
  user,
  onJoin,
  loading,
}: {
  user: User;
  onJoin: (code: string) => void;
  loading: boolean;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Por favor ingresa el código de tu salón."); return; }
    if (trimmed.length < 3) { setError("El código debe tener al menos 3 caracteres."); return; }
    onJoin(trimmed);
  };

  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up text-center">
        <div className="text-5xl mb-4">🏫</div>
        <h2 className="text-2xl font-extrabold text-gray-900">Unirse al Salón</h2>
        <p className="mt-2 text-gray-500 text-sm">
          Hola, <strong>{user.displayName?.split(" ")[0]}</strong>. Ingresa el código de tu salón.
        </p>

        <div className="my-5 border-t border-gray-100" />

        <div className="space-y-4">
          <input
            type="text"
            className="input-field text-center uppercase tracking-widest text-xl"
            placeholder="Ej: 3SEC-A"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={12}
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-red-500 text-sm font-medium animate-slide-down">⚠️ {error}</p>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            {["3SEC-A", "2PRI-B", "1ECO-C"].map((c) => (
              <button
                key={c}
                className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-xs text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                onClick={() => { setCode(c); setError(""); }}
                disabled={loading}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full py-4 px-6 rounded-2xl font-bold text-base cursor-pointer disabled:opacity-60"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "⚙️ Guardando..." : "Unirse al Salón →"}
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">¿No tienes el código? Pídele a tu profesor.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MINIJUEGO: Limpiar el cuarto
// ═══════════════════════════════════════════════════════════════════════════
function MinigameScreen({ onComplete }: { onComplete: () => void }) {
  const [round, setRound] = useState(0);
  const [objects, setObjects] = useState<RoomObject[]>(() =>
    generateObjects(ROOM_CONFIGS[0], 0)
  );
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [showTransition, setShowTransition] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentRoom = ROOM_CONFIGS[round];
  const total = objects.length;
  const cleaned = objects.filter((o) => o.cleaned).length;
  const allCleaned = cleaned === total;
  const progress = total > 0 ? (cleaned / total) * 100 : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleClean = useCallback((id: number) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id && !o.cleaned ? { ...o, cleaned: true } : o))
    );
  }, []);

  useEffect(() => {
    if (allCleaned && !transitioning) {
      setTransitioning(true);
      setShowTransition(true);
      setTimeout(() => {
        if (round < ROOM_CONFIGS.length - 1) {
          const next = round + 1;
          setRound(next);
          setObjects(generateObjects(ROOM_CONFIGS[next], next));
          setShowTransition(false);
          setTransitioning(false);
        } else {
          onComplete();
        }
      }, 1500);
    }
  }, [allCleaned, round, transitioning, onComplete]);

  return (
    <div
      className="minigame-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ background: currentRoom.bg }}
    >
      <div className="minigame-hud">
        <div className="minigame-hud-inner">
          <div className="hud-room-badge">🏠 {currentRoom.name}</div>
          <div className="hud-round">Habitación {round + 1} de {ROOM_CONFIGS.length}</div>
          <div className="hud-progress-wrap">
            <div className="hud-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="hud-count">{cleaned}/{total} limpiados</div>
        </div>
      </div>

      <div className="room-floor" style={{ background: currentRoom.floorColor + "88" }} />

      <div className="room-deco">
        {round === 0 && (<><div className="deco-bed">🛏️</div><div className="deco-desk">🖥️</div></>)}
        {round === 1 && (<><div className="deco-sofa">🛋️</div><div className="deco-tv">📺</div></>)}
        {round === 2 && (<><div className="deco-fridge">🧊</div><div className="deco-table">🍽️</div></>)}
      </div>

      {objects.map((obj) => (
        <button
          key={obj.id}
          className={`room-object ${obj.cleaned ? "room-object--cleaned" : ""}`}
          style={{
            left: `${obj.x}%`, top: `${obj.y}%`,
            transform: `rotate(${obj.rotation}deg) scale(${obj.scale})`,
            fontSize: `${1.8 * obj.scale}rem`,
            pointerEvents: obj.cleaned ? "none" : "auto",
          }}
          onClick={() => handleClean(obj.id)}
        >
          {obj.emoji}
        </button>
      ))}

      <div className="broom-cursor" style={{ left: cursorPos.x, top: cursorPos.y }}>🧹</div>

      {showTransition && (
        <div className="room-transition">
          {round < ROOM_CONFIGS.length - 1 ? (
            <>
              <div className="transition-emoji">✨</div>
              <div className="transition-text">¡{currentRoom.name} limpia!</div>
              <div className="transition-sub">Siguiente: {ROOM_CONFIGS[round + 1].name}</div>
            </>
          ) : (
            <>
              <div className="transition-emoji">🎉</div>
              <div className="transition-text">¡Todo limpio!</div>
              <div className="transition-sub">¡Misión completada!</div>
            </>
          )}
        </div>
      )}

      <div className="minigame-instructions">🧹 Haz clic en cada objeto para limpiarlo</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: NPC Vagoneta — barra de 30 segundos
// ═══════════════════════════════════════════════════════════════════════════
const VAGONETA_SECONDS = 30;

function VagonetaScreen({ onComplete }: { onComplete: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (elapsed >= VAGONETA_SECONDS) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed]);

  const progress = Math.min((elapsed / VAGONETA_SECONDS) * 100, 100);
  const remaining = VAGONETA_SECONDS - elapsed;

  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-10 w-full max-w-sm animate-pop-in text-center">
        <div className="text-7xl mb-4" style={{ animation: done ? "none" : "coinBounce 1s ease infinite" }}>
          {done ? "💸" : "😴"}
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
          {done ? "¡Listo, el NPC trabajó!" : "El NPC Vagoneta está trabajando..."}
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {done
            ? "Te cobró S/. 0.50 de comisión. Ganaste S/. 1.50 netos."
            : `El NPC Vagoneta hace el trabajo por ti... pero te cobra S/. 0.50 de comisión. Espera ${remaining}s.`}
        </p>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
            <span>{done ? "¡Completado!" : "Progreso del NPC"}</span>
            <span>{done ? "30/30s" : `${elapsed}/${VAGONETA_SECONDS}s`}</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: done
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : "linear-gradient(90deg, #f59e0b, #d97706)",
              }}
            />
          </div>
          {!done && (
            <p className="mt-1 text-xs text-gray-400">
              La flojera tiene un precio... 💸
            </p>
          )}
        </div>

        {done && (
          <button
            className="btn-success w-full py-3.5 px-6 rounded-2xl font-bold text-base cursor-pointer animate-pop-in"
            onClick={onComplete}
          >
            Cobrar S/. 1.50 →
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Victoria (Misión Manual)
// ═══════════════════════════════════════════════════════════════════════════
function VictoryScreen({ newBalance, newRacha, onContinue }: {
  newBalance: number;
  newRacha: number;
  onContinue: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onContinue, 4500);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-10 w-full max-w-sm animate-pop-in text-center">
        <div className="text-7xl mb-4 animate-coin-bounce">🏆</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Felicitaciones!</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          Limpiaste tú mismo y ganaste el máximo.
          ¡Eso es <span className="font-bold text-green-600">responsabilidad financiera</span>!
        </p>
        <div className="space-y-2">
          <div className="py-3 px-5 rounded-2xl message-success text-lg font-extrabold">
            +S/. 2.00 al saldo 💰
          </div>
          <div className="py-2 px-4 rounded-xl bg-orange-50 border border-orange-200 text-sm font-bold text-orange-700">
            🔥 Racha: {newRacha} día{newRacha !== 1 ? "s" : ""} consecutivo{newRacha !== 1 ? "s" : ""}
          </div>
          <p className="text-xs text-gray-400 pt-1">Saldo: S/. {newBalance.toFixed(2)}</p>
        </div>
        <p className="mt-5 text-xs text-gray-400">Guardando en la nube...</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Panel del juego
// ═══════════════════════════════════════════════════════════════════════════
function GameScreen({
  user,
  userDoc,
  missionDoneToday,
  displayRacha,
  onStartMinigame,
  onStartVagoneta,
  onSignOut,
}: {
  user: User;
  userDoc: UserDoc;
  missionDoneToday: boolean;
  displayRacha: number;
  onStartMinigame: () => void;
  onStartVagoneta: () => void;
  onSignOut: () => void;
}) {
  const [localBalance, setLocalBalance] = useState(userDoc.saldo);
  const [balanceAnim, setBalanceAnim] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "warning"; text: string } | null>(null);
  const [history, setHistory] = useState<Array<{ type: "positive" | "negative"; text: string; amount: string }>>([]);
  const [locked, setLocked] = useState(missionDoneToday);

  const fmt = (n: number) => `S/. ${n.toFixed(2)}`;

  const showMsg = (m: typeof message) => {
    setMessage(m);
    setTimeout(() => setMessage(null), 6000);
  };

  const triggerBounce = () => {
    setBalanceAnim(true);
    setTimeout(() => setBalanceAnim(false), 600);
  };

  useEffect(() => {
    type RewardFn = (amount: number, tipo: "manual" | "vagoneta") => void;
    (window as Window & { __applyMissionReward?: RewardFn }).__applyMissionReward =
      (amount: number, tipo: "manual" | "vagoneta") => {
        setLocalBalance((b) => {
          const nb = b + amount;
          triggerBounce();
          return nb;
        });
        if (tipo === "manual") {
          setHistory((h) => [
            { type: "positive", text: "Misión Manual completada 💪", amount: `+S/. ${amount.toFixed(2)}` },
            ...h,
          ].slice(0, 6));
          showMsg({
            type: "success",
            text: `¡Excelente! Ganaste S/. ${amount.toFixed(2)} limpiando tú mismo. ¡Eso es responsabilidad financiera! 💪`,
          });
        } else {
          setHistory((h) => [
            { type: "negative", text: "NPC Vagoneta trabajó por ti 😴", amount: `+S/. ${amount.toFixed(2)}` },
            ...h,
          ].slice(0, 6));
          showMsg({
            type: "warning",
            text: `El NPC Vagoneta te cobró S/. 0.50 de comisión. Ganaste S/. ${amount.toFixed(2)} netos. ¡La flojera cuesta!`,
          });
        }
        setLocked(true);
      };
  }, []);

  return (
    <div className="screen-bg min-h-screen p-4 pb-10">
      <div className="max-w-xl mx-auto space-y-4 pt-6">

        {/* Header jugador */}
        <div className="glass-card rounded-3xl p-5 animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Jugador</p>
            <h2 className="text-xl font-extrabold text-gray-900">{user.displayName ?? "Estudiante"}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                {userDoc.aula}
              </span>
              <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">
                🔥 {displayRacha} día{displayRacha !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-full border-2 border-indigo-200" />
            )}
            <button
              className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
              onClick={onSignOut}
            >
              Salir
            </button>
          </div>
        </div>

        {/* Saldo */}
        <div className="glass-card rounded-3xl p-8 animate-fade-in-up text-center" style={{ animationDelay: "0.08s" }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Saldo Acumulado</p>
          <div
            className={`balance-display text-6xl sm:text-7xl font-black tracking-tight ${balanceAnim ? "animate-coin-bounce" : ""}`}
            key={String(balanceAnim)}
          >
            {fmt(localBalance)}
          </div>
          <p className="mt-2 text-xs text-gray-400">Soles peruanos (S/.)</p>
        </div>

        {/* Misión del día */}
        <div className="glass-card rounded-3xl p-5 animate-fade-in-up" style={{ animationDelay: "0.14s" }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Misión de Hoy</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                Ganar S/. 2.00 limpiando tu cuarto
              </p>
              {locked && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  ✅ ¡Completada hoy!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje */}
        {message && (
          <div className={`rounded-2xl p-4 animate-slide-down text-sm font-medium leading-relaxed ${message.type === "success" ? "message-success" : "message-warning"}`}>
            {message.text}
          </div>
        )}

        {/* Botones / bloqueado */}
        <div className="glass-card rounded-3xl p-6 animate-fade-in-up space-y-4" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Elige tu acción</h3>

          {locked ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#f3f4f6", border: "2px dashed #d1d5db" }}>
              <div className="text-3xl mb-2">⏳</div>
              <p className="font-bold text-gray-500 text-sm">Ya realizaste tu misión por hoy.</p>
              <p className="text-gray-400 text-xs mt-1">
                Regresa mañana para seguir acumulando soles.
              </p>
            </div>
          ) : (
            <>
              {/* Misión Manual */}
              <button
                className="btn-success w-full py-4 px-5 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
                onClick={onStartMinigame}
              >
                <span className="text-2xl">💪</span>
                <span className="flex-1">
                  <span className="block">Misión Manual</span>
                  <span className="block text-green-100 text-xs font-medium mt-0.5">
                    Consumo Responsable · Ganas S/. 2.00 completos
                  </span>
                </span>
                <span className="text-green-200 text-sm self-center">▶</span>
              </button>

              {/* NPC Vagoneta */}
              <button
                className="btn-warning w-full py-4 px-5 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
                onClick={onStartVagoneta}
              >
                <span className="text-2xl">😴</span>
                <span className="flex-1">
                  <span className="block">NPC Vagoneta</span>
                  <span className="block text-yellow-100 text-xs font-medium mt-0.5">
                    Consumo Irresponsable · Espera 30s · Solo recibes S/. 1.50
                  </span>
                </span>
              </button>

              {/* Comparativa */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-xl p-2 text-center bg-green-50 border border-green-100">
                  <p className="text-xs text-green-600 font-semibold">Misión Manual</p>
                  <p className="text-lg font-extrabold text-green-700">S/. 2.00</p>
                  <p className="text-xs text-green-500">máximo</p>
                </div>
                <div className="rounded-xl p-2 text-center bg-yellow-50 border border-yellow-100">
                  <p className="text-xs text-yellow-600 font-semibold">NPC Vagoneta</p>
                  <p className="text-lg font-extrabold text-yellow-700">S/. 1.50</p>
                  <p className="text-xs text-yellow-500">−S/. 0.50 comisión</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up" style={{ animationDelay: "0.28s" }}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📋 Historial</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className={`history-item ${item.type}`}>
                  <span>{item.type === "positive" ? "✅" : "⚠️"}</span>
                  <span className="flex-1">{item.text}</span>
                  <span className="font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          💡 Cada decisión responsable suma a tu futuro financiero.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [displayRacha, setDisplayRacha] = useState(1);
  const [missionDoneToday, setMissionDoneToday] = useState(false);
  const [victoryData, setVictoryData] = useState({ newBalance: 0, newRacha: 1 });

  // ── Observador de auth ──────────────────────────────────────────────────
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !auth) { setScreen("login"); return; }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setFirebaseUser(null);
        setUserDoc(null);
        setScreen("login");
        return;
      }
      setFirebaseUser(u);
      await loadUserDoc(u);
    });
    return unsub;
  }, []);

  // ── Cargar datos de Firestore ───────────────────────────────────────────
  const loadUserDoc = async (u: User) => {
    try {
      const snap = await getDoc(doc(db!, "usuarios", u.uid));
      if (!snap.exists()) {
        setScreen("classroom");
        return;
      }
      const data = snap.data() as UserDoc;
      setUserDoc(data);
      computeStreak(data);
      setScreen("game");
    } catch (e) {
      console.error(e);
      setAuthError("Error al cargar tus datos. Revisa la conexión y las reglas de Firestore.");
      setScreen("login");
    }
  };

  // ── Calcular racha y bloqueo ────────────────────────────────────────────
  const computeStreak = (data: UserDoc) => {
    const today = todayStr();
    const yesterday = yesterdayStr();
    const last = data.ultimaMision;
    if (last === today) {
      setDisplayRacha(data.racha);
      setMissionDoneToday(true);
    } else if (last === yesterday) {
      setDisplayRacha(data.racha + 1);
      setMissionDoneToday(false);
    } else {
      setDisplayRacha(1);
      setMissionDoneToday(false);
    }
  };

  const calcNewRacha = (data: UserDoc): number => {
    return data.ultimaMision === yesterdayStr() ? data.racha + 1 : 1;
  };

  // ── Login ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth!, googleProvider!);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (!msg.includes("popup-closed")) {
        setAuthError("No se pudo iniciar sesión. Verifica que el dominio esté autorizado en Firebase Auth.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Unirse al salón ─────────────────────────────────────────────────────
  const handleJoin = async (code: string) => {
    if (!firebaseUser) return;
    setSaveLoading(true);
    try {
      const newDoc: UserDoc = {
        nombre: firebaseUser.displayName ?? "Estudiante",
        correo: firebaseUser.email ?? "",
        aula: code,
        saldo: 0,
        racha: 0,
        ultimaMision: null,
      };
      await setDoc(doc(db!, "usuarios", firebaseUser.uid), {
        ...newDoc,
        creadoEn: serverTimestamp(),
      });
      setUserDoc(newDoc);
      setDisplayRacha(1);
      setMissionDoneToday(false);
      setScreen("game");
    } catch (e) {
      console.error(e);
      setAuthError("Error al guardar en Firestore. Revisa las reglas de seguridad.");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Guardar misión en Firestore ─────────────────────────────────────────
  const saveMission = async (amount: number): Promise<{ newBal: number; newRacha: number }> => {
    if (!firebaseUser || !userDoc) return { newBal: 0, newRacha: 1 };
    const newBal = userDoc.saldo + amount;
    const newRacha = calcNewRacha(userDoc);
    try {
      await updateDoc(doc(db!, "usuarios", firebaseUser.uid), {
        saldo: newBal,
        racha: newRacha,
        ultimaMision: todayStr(),
      });
      const updated = { ...userDoc, saldo: newBal, racha: newRacha, ultimaMision: todayStr() };
      setUserDoc(updated);
      setDisplayRacha(newRacha);
    } catch (e) {
      console.error("Error guardando en Firestore:", e);
    }
    return { newBal, newRacha };
  };

  // ── Misión Manual → victory ─────────────────────────────────────────────
  const handleMinigameComplete = () => setScreen("victory");

  const handleVictoryContinue = async () => {
    const { newBal, newRacha } = await saveMission(2.0);
    setVictoryData({ newBalance: newBal, newRacha });
    setScreen("game");
    setTimeout(() => {
      type RewardFn = (amount: number, tipo: "manual" | "vagoneta") => void;
      const fn = (window as Window & { __applyMissionReward?: RewardFn }).__applyMissionReward;
      if (fn) fn(2.0, "manual");
    }, 120);
  };

  // ── NPC Vagoneta completa ───────────────────────────────────────────────
  const handleVagonetaComplete = async () => {
    const { newBal } = await saveMission(1.5);
    setScreen("game");
    setTimeout(() => {
      type RewardFn = (amount: number, tipo: "manual" | "vagoneta") => void;
      const fn = (window as Window & { __applyMissionReward?: RewardFn }).__applyMissionReward;
      if (fn) fn(1.5, "vagoneta");
    }, 120);
    setVictoryData((v) => ({ ...v, newBalance: newBal }));
  };

  // ── Cerrar sesión ───────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut(auth!);
    setUserDoc(null);
    setFirebaseUser(null);
    setScreen("login");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (screen === "loading") return <LoadingScreen message="Verificando sesión..." />;

  if (screen === "login")
    return <LoginScreen onLogin={handleLogin} loading={authLoading} error={authError} />;

  if (screen === "classroom" && firebaseUser)
    return <ClassroomScreen user={firebaseUser} onJoin={handleJoin} loading={saveLoading} />;

  if (screen === "minigame")
    return <MinigameScreen onComplete={handleMinigameComplete} />;

  if (screen === "vagoneta")
    return <VagonetaScreen onComplete={handleVagonetaComplete} />;

  if (screen === "victory")
    return (
      <VictoryScreen
        newBalance={victoryData.newBalance}
        newRacha={victoryData.newRacha}
        onContinue={handleVictoryContinue}
      />
    );

  if (screen === "game" && firebaseUser && userDoc)
    return (
      <GameScreen
        user={firebaseUser}
        userDoc={userDoc}
        missionDoneToday={missionDoneToday}
        displayRacha={displayRacha}
        onStartMinigame={() => setScreen("minigame")}
        onStartVagoneta={() => setScreen("vagoneta")}
        onSignOut={handleSignOut}
      />
    );

  return <LoadingScreen message="Iniciando..." />;
}
