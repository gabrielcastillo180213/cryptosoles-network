import { useState, useCallback } from "react";
import "./index.css";

type Screen = "login" | "classroom" | "game";

interface GameState {
  playerName: string;
  section: string;
  balance: number;
  history: Array<{ type: "positive" | "negative"; text: string; amount: string }>;
  message: { type: "success" | "warning"; text: string } | null;
  balanceAnimating: boolean;
}

function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  return (
    <div className="screen-bg flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Finanzas<br />
            <span className="text-indigo-600">en Juego</span>
          </h1>
          <p className="mt-3 text-gray-500 text-base leading-relaxed">
            Simulador económico escolar
          </p>
        </div>

        <div className="my-8 border-t border-gray-100" />

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Bienvenido al simulador
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Aprende a tomar decisiones financieras inteligentes jugando con tu salón.
          </p>

          <button
            className="btn-google w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-semibold text-base cursor-pointer"
            onClick={() => onLogin("Estudiante")}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            🔑 Iniciar Sesión con Google
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Proyecto escolar de educación financiera
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
    if (!trimmed) {
      setError("Por favor, ingresa el código de tu salón.");
      return;
    }
    if (trimmed.length < 3) {
      setError("El código debe tener al menos 3 caracteres.");
      return;
    }
    onJoin(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="screen-bg flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up text-center">
        <div className="mb-6">
          <div className="text-5xl mb-4">🏫</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Unirse al Salón
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Ingresa el código que te dio tu profesor para acceder al simulador.
          </p>
        </div>

        <div className="my-6 border-t border-gray-100" />

        <div className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código de Salón
            </label>
            <input
              type="text"
              className="input-field text-center uppercase tracking-widest"
              placeholder="Ej: 3SEC-A"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={handleKeyDown}
              maxLength={12}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-red-500 text-sm font-medium animate-slide-down">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 text-xs text-gray-400 items-center justify-center">
            <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">3SEC-A</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">2PRI-B</span>
            <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">1ECO-C</span>
          </div>

          <button
            className="btn-primary w-full py-3.5 px-6 rounded-2xl font-bold text-base cursor-pointer mt-2"
            onClick={handleJoin}
          >
            Unirse al Salón →
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          ¿No tienes el código? Pídele a tu profesor.
        </p>
      </div>
    </div>
  );
}

function GameScreen({ section }: { section: string }) {
  const [state, setState] = useState<GameState>({
    playerName: "Estudiante",
    section,
    balance: 0,
    history: [],
    message: null,
    balanceAnimating: false,
  });

  const triggerAction = useCallback((type: "responsible" | "irresponsable") => {
    setState((prev) => {
      const isResponsible = type === "responsible";
      const amount = isResponsible ? 2.0 : 0.1;
      const newBalance = prev.balance + amount;

      const historyEntry = isResponsible
        ? { type: "positive" as const, text: "Misión completada tú mismo", amount: "+S/. 2.00" }
        : { type: "negative" as const, text: "Pagaste al NPC Flojonazo", amount: "+S/. 0.10" };

      const message = isResponsible
        ? {
            type: "success" as const,
            text: "¡Excelente! Hiciste la misión tú mismo y ahorraste S/. 1.90 en comisiones. ¡Eso es responsabilidad financiera! 💪",
          }
        : {
            type: "warning" as const,
            text: "Gastaste S/. 1.90 en comisiones por flojera. El NPC Flojonazo se quedó con casi todo tu dinero. ¡Piénsalo dos veces! 😴",
          };

      return {
        ...prev,
        balance: newBalance,
        history: [historyEntry, ...prev.history].slice(0, 6),
        message,
        balanceAnimating: true,
      };
    });

    setTimeout(() => {
      setState((prev) => ({ ...prev, balanceAnimating: false }));
    }, 600);

    setTimeout(() => {
      setState((prev) => ({ ...prev, message: null }));
    }, 5000);
  }, []);

  const formatBalance = (n: number) =>
    `S/. ${n.toFixed(2)}`;

  return (
    <div className="screen-bg min-h-screen p-4 pb-10">
      <div className="max-w-xl mx-auto space-y-4 pt-6">

        {/* Header */}
        <div className="glass-card rounded-3xl p-5 animate-fade-in-up flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Jugador</p>
            <h2 className="text-xl font-extrabold text-gray-900">{state.playerName}</h2>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              {state.section}
            </span>
          </div>
          <div className="text-4xl">👤</div>
        </div>

        {/* Balance */}
        <div
          className="glass-card rounded-3xl p-8 animate-fade-in-up text-center"
          style={{ animationDelay: "0.1s" }}
        >
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Saldo Acumulado
          </p>
          <div
            className={`balance-display text-6xl sm:text-7xl font-black tracking-tight ${
              state.balanceAnimating ? "animate-coin-bounce" : ""
            }`}
            key={state.balance}
          >
            {formatBalance(state.balance)}
          </div>
          <p className="mt-3 text-xs text-gray-400">Soles peruanos (S/.)</p>
        </div>

        {/* Message */}
        {state.message && (
          <div
            className={`rounded-2xl p-4 animate-slide-down text-sm font-medium leading-relaxed ${
              state.message.type === "success" ? "message-success" : "message-warning"
            }`}
          >
            {state.message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="glass-card rounded-3xl p-6 animate-fade-in-up space-y-4"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider text-center mb-2">
            Mecánicas del Juego
          </h3>

          <button
            className="btn-success w-full py-4 px-6 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
            onClick={() => triggerAction("responsible")}
          >
            <span className="text-2xl">💪</span>
            <span className="flex-1">
              <span className="block">Hacer la misión yo mismo</span>
              <span className="block text-green-100 text-xs font-medium mt-0.5">
                Consumo Responsable · Ganas S/. 2.00
              </span>
            </span>
          </button>

          <button
            className="btn-warning w-full py-4 px-6 rounded-2xl font-bold text-base cursor-pointer text-left flex items-start gap-3"
            onClick={() => triggerAction("irresponsable")}
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
          <div
            className="glass-card rounded-3xl p-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              📋 Historial de Decisiones
            </h3>
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

        {/* Footer tip */}
        <div
          className="text-center animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-xs text-gray-400">
            💡 Tip: Cada S/. que ahorras en comisiones suma a largo plazo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [classroomCode, setClassroomCode] = useState("");

  const handleLogin = (_name: string) => {
    setScreen("classroom");
  };

  const handleJoin = (code: string) => {
    setClassroomCode(code);
    setScreen("game");
  };

  return (
    <>
      {screen === "login" && <LoginScreen onLogin={handleLogin} />}
      {screen === "classroom" && <ClassroomScreen onJoin={handleJoin} />}
      {screen === "game" && <GameScreen section={classroomCode} />}
    </>
  );
}
