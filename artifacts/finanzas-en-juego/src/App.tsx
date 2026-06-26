import { useState, useCallback, useRef, useEffect } from "react";
import "./index.css";

type Screen = "login" | "classroom" | "game" | "minigame" | "victory";

interface RoomObject {
  id: number;
  emoji: string;
  x: number;
  y: number;
  cleaned: boolean;
  rotation: number;
  scale: number;
}

interface GameState {
  balance: number;
  history: Array<{ type: "positive" | "negative"; text: string; amount: string }>;
  message: { type: "success" | "warning"; text: string } | null;
  balanceAnimating: boolean;
}

const ROOM_CONFIGS = [
  {
    name: "Tu Cuarto",
    bg: "linear-gradient(160deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)",
    wallColor: "#bfdbfe",
    floorColor: "#93c5fd",
    objects: ["📄", "👕", "🧸", "🧦", "📚", "🎮", "👟"],
    count: 7,
  },
  {
    name: "La Sala",
    bg: "linear-gradient(160deg, #fef9c3 0%, #fde68a 40%, #fbbf24 100%)",
    wallColor: "#fde68a",
    floorColor: "#fbbf24",
    objects: ["🍕", "🥤", "📰", "🎒", "🧃", "🍿", "🧢"],
    count: 8,
  },
  {
    name: "La Cocina",
    bg: "linear-gradient(160deg, #dcfce7 0%, #bbf7d0 40%, #86efac 100%)",
    wallColor: "#bbf7d0",
    floorColor: "#86efac",
    objects: ["🥄", "🍳", "🧻", "🫙", "🍱", "🥢", "🧹"],
    count: 9,
  },
];

function generateObjects(config: (typeof ROOM_CONFIGS)[0], round: number): RoomObject[] {
  const objs: RoomObject[] = [];
  const usedPositions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < config.count + round; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = 8 + Math.random() * 72;
      y = 20 + Math.random() * 55;
      attempts++;
    } while (
      attempts < 30 &&
      usedPositions.some((p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 8)
    );

    usedPositions.push({ x, y });
    objs.push({
      id: i,
      emoji: config.objects[i % config.objects.length],
      x,
      y,
      cleaned: false,
      rotation: Math.random() * 60 - 30,
      scale: 0.8 + Math.random() * 0.5,
    });
  }
  return objs;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up text-center">
        <div className="mb-6">
          <div className="text-7xl mb-5">🏦</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Simulador de
            <br />
            <span className="text-indigo-600">Finanzas Personales</span>
          </h1>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Aprende a tomar decisiones financieras inteligentes jugando con tu salón.
          </p>
        </div>

        <div className="my-6 border-t border-gray-100" />

        <button
          className="btn-google w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-base cursor-pointer"
          onClick={onLogin}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
          🔑 Iniciar Sesión con Google
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Proyecto escolar · Educación financiera
        </p>
      </div>
    </div>
  );
}

function ClassroomScreen({ onJoin }: { onJoin: (code: string) => void }) {
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
        <p className="mt-2 text-gray-500 text-sm mb-6">
          Ingresa el código que te dio tu profesor.
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
          />
          {error && (
            <p className="text-red-500 text-sm font-medium animate-slide-down">⚠️ {error}</p>
          )}
          <div className="flex gap-2 justify-center">
            {["3SEC-A", "2PRI-B", "1ECO-C"].map((c) => (
              <button
                key={c}
                className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-xs text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                onClick={() => { setCode(c); setError(""); }}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            className="btn-primary w-full py-4 px-6 rounded-2xl font-bold text-base cursor-pointer"
            onClick={handleJoin}
          >
            Unirse al Salón →
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">¿No tienes el código? Pídele a tu profesor.</p>
      </div>
    </div>
  );
}

function MinigameScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [round, setRound] = useState(0);
  const [objects, setObjects] = useState<RoomObject[]>(() =>
    generateObjects(ROOM_CONFIGS[0], 0)
  );
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
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
          const nextRound = round + 1;
          setRound(nextRound);
          setObjects(generateObjects(ROOM_CONFIGS[nextRound], nextRound));
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
      {/* HUD */}
      <div className="minigame-hud">
        <div className="minigame-hud-inner">
          <div className="hud-room-badge">
            🏠 {currentRoom.name}
          </div>
          <div className="hud-round">
            Habitación {round + 1} de {ROOM_CONFIGS.length}
          </div>
          <div className="hud-progress-wrap">
            <div
              className="hud-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="hud-count">
            {cleaned}/{total} objetos limpiados
          </div>
        </div>
      </div>

      {/* Room visual */}
      <div className="room-floor" style={{ background: currentRoom.floorColor + "88" }} />

      {/* Furniture decorations */}
      <div className="room-deco">
        {round === 0 && (
          <>
            <div className="deco-bed">🛏️</div>
            <div className="deco-desk">🖥️</div>
          </>
        )}
        {round === 1 && (
          <>
            <div className="deco-sofa">🛋️</div>
            <div className="deco-tv">📺</div>
          </>
        )}
        {round === 2 && (
          <>
            <div className="deco-fridge">🧊</div>
            <div className="deco-table">🍽️</div>
          </>
        )}
      </div>

      {/* Objects to clean */}
      {objects.map((obj) => (
        <button
          key={obj.id}
          className={`room-object ${obj.cleaned ? "room-object--cleaned" : ""}`}
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `rotate(${obj.rotation}deg) scale(${obj.scale})`,
            fontSize: `${1.8 * obj.scale}rem`,
            pointerEvents: obj.cleaned ? "none" : "auto",
          }}
          onClick={() => handleClean(obj.id)}
        >
          {obj.emoji}
        </button>
      ))}

      {/* Custom broom cursor */}
      <div
        className="broom-cursor"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      >
        🧹
      </div>

      {/* Room transition overlay */}
      {showTransition && (
        <div className="room-transition">
          {round < ROOM_CONFIGS.length - 1 ? (
            <>
              <div className="transition-emoji">✨</div>
              <div className="transition-text">¡{currentRoom.name} limpia!</div>
              <div className="transition-sub">
                Siguiente: {ROOM_CONFIGS[round + 1].name}
              </div>
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

      {/* Instructions */}
      <div className="minigame-instructions">
        🧹 Haz clic en cada objeto para limpiarlo
      </div>
    </div>
  );
}

function VictoryScreen({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 4000);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="screen-bg flex items-center justify-center p-4 min-h-screen">
      <div className="glass-card rounded-3xl p-10 w-full max-w-sm animate-pop-in text-center">
        <div className="text-7xl mb-4 animate-coin-bounce">🏆</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          ¡Felicitaciones!
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Completaste la misión por tu propio esfuerzo. 
          ¡Eso es <span className="font-bold text-green-600">responsabilidad financiera</span>!
          Ahorraste <span className="font-bold text-indigo-600">S/. 1.90</span> en comisiones.
        </p>
        <div className="py-4 px-6 rounded-2xl message-success text-lg font-extrabold">
          +S/. 2.00 al saldo 💰
        </div>
        <p className="mt-4 text-xs text-gray-400">Volviendo al tablero...</p>
      </div>
    </div>
  );
}

function GameScreen({
  section,
  onStartMinigame,
}: {
  section: string;
  onStartMinigame: () => void;
}) {
  const [state, setState] = useState<GameState>({
    balance: 0,
    history: [],
    message: null,
    balanceAnimating: false,
  });
  const [missionDone, setMissionDone] = useState(false);

  const triggerFlojonazo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      balance: prev.balance + 0.1,
      balanceAnimating: true,
      history: [
        { type: "negative", text: "Pagaste al NPC Flojonazo", amount: "+S/. 0.10" },
        ...prev.history,
      ].slice(0, 6),
      message: {
        type: "warning",
        text: "Gastaste S/. 1.90 en comisiones por flojera. El NPC Flojonazo se quedó con casi todo tu dinero. ¡Piénsalo dos veces! 😴",
      },
    }));
    setTimeout(() => setState((prev) => ({ ...prev, balanceAnimating: false })), 600);
    setTimeout(() => setState((prev) => ({ ...prev, message: null })), 5000);
  }, []);

  const applyMissionReward = useCallback(() => {
    setMissionDone(true);
    setState((prev) => ({
      ...prev,
      balance: prev.balance + 2.0,
      balanceAnimating: true,
      history: [
        { type: "positive", text: "Misión manual completada 💪", amount: "+S/. 2.00" },
        ...prev.history,
      ].slice(0, 6),
      message: {
        type: "success",
        text: "¡Excelente esfuerzo! Ganaste S/. 2.00 limpiando por ti mismo. ¡Eso es responsabilidad financiera! 💪",
      },
    }));
    setTimeout(() => setState((prev) => ({ ...prev, balanceAnimating: false })), 600);
    setTimeout(() => setState((prev) => ({ ...prev, message: null })), 6000);
  }, []);

  useEffect(() => {
    (window as Window & { __applyMissionReward?: () => void }).__applyMissionReward = applyMissionReward;
  }, [applyMissionReward]);

  const fmt = (n: number) => `S/. ${n.toFixed(2)}`;

  return (
    <div className="screen-bg min-h-screen p-4 pb-10">
      <div className="max-w-xl mx-auto space-y-4 pt-6">

        {/* Player card */}
        <div className="glass-card rounded-3xl p-5 animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Jugador</p>
            <h2 className="text-xl font-extrabold text-gray-900">Estudiante</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              {section}
            </span>
          </div>
          <div className="text-5xl">🧑‍🎓</div>
        </div>

        {/* Balance */}
        <div className="glass-card rounded-3xl p-8 animate-fade-in-up text-center" style={{ animationDelay: "0.08s" }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Saldo Acumulado</p>
          <div
            className={`balance-display text-6xl sm:text-7xl font-black tracking-tight ${state.balanceAnimating ? "animate-coin-bounce" : ""}`}
            key={state.balance}
          >
            {fmt(state.balance)}
          </div>
          <p className="mt-2 text-xs text-gray-400">Soles peruanos (S/.)</p>
        </div>

        {/* Today's mission */}
        <div className="glass-card rounded-3xl p-5 animate-fade-in-up" style={{ animationDelay: "0.14s" }}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Misión de Hoy</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                Ganar S/. 2.00 limpiando tu cuarto
              </p>
              {missionDone && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  ✅ ¡Completada!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {state.message && (
          <div className={`rounded-2xl p-4 animate-slide-down text-sm font-medium leading-relaxed ${state.message.type === "success" ? "message-success" : "message-warning"}`}>
            {state.message.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="glass-card rounded-3xl p-6 animate-fade-in-up space-y-4" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Elige tu acción</h3>

          <button
            className="btn-success w-full py-4 px-5 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
            onClick={onStartMinigame}
          >
            <span className="text-2xl">💪</span>
            <span className="flex-1">
              <span className="block">Misión Manual</span>
              <span className="block text-green-100 text-xs font-medium mt-0.5">
                Consumo Responsable · ¡Limpia y gana S/. 2.00!
              </span>
            </span>
            <span className="text-green-200 text-sm self-center">▶</span>
          </button>

          <button
            className="btn-warning w-full py-4 px-5 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
            onClick={triggerFlojonazo}
          >
            <span className="text-2xl">😴</span>
            <span className="flex-1">
              <span className="block">Pagarle al NPC Flojonazo</span>
              <span className="block text-yellow-100 text-xs font-medium mt-0.5">
                Consumo Irresponsable · Solo recibes S/. 0.10
              </span>
            </span>
          </button>
        </div>

        {/* History */}
        {state.history.length > 0 && (
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up" style={{ animationDelay: "0.28s" }}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📋 Historial</h3>
            <div className="space-y-2">
              {state.history.map((item, i) => (
                <div key={i} className={`history-item ${item.type}`}>
                  <span>{item.type === "positive" ? "✅" : "⚠️"}</span>
                  <span className="flex-1">{item.text}</span>
                  <span className="font-bold">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          💡 Cada decisión responsable suma a tu futuro financiero.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [classroomCode, setClassroomCode] = useState("");
  const gameScreenRef = useRef<{ applyReward: () => void } | null>(null);

  const handleMinigameComplete = useCallback(() => {
    setScreen("victory");
  }, []);

  const handleVictoryContinue = useCallback(() => {
    setScreen("game");
    setTimeout(() => {
      const fn = (window as Window & { __applyMissionReward?: () => void }).__applyMissionReward;
      if (fn) fn();
    }, 100);
  }, []);

  return (
    <>
      {screen === "login" && (
        <LoginScreen onLogin={() => setScreen("classroom")} />
      )}
      {screen === "classroom" && (
        <ClassroomScreen
          onJoin={(code) => {
            setClassroomCode(code);
            setScreen("game");
          }}
        />
      )}
      {screen === "game" && (
        <GameScreen
          key="game"
          section={classroomCode}
          onStartMinigame={() => setScreen("minigame")}
        />
      )}
      {screen === "minigame" && (
        <MinigameScreen onComplete={handleMinigameComplete} />
      )}
      {screen === "victory" && (
        <VictoryScreen onContinue={handleVictoryContinue} />
      )}
    </>
  );
}
