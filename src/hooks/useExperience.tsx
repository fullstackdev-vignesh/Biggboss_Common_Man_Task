import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { startSession } from "@/lib/api";
import type { SpinResult, Stage } from "@/types";

const SESSION_STORAGE_KEY = "bb-common-man-session";

interface ExperienceValue {
  stage: Stage;
  sessionId: string | null;
  spinResult: SpinResult | null;
  entering: boolean;
  enterTask: () => Promise<{ ok: true } | { ok: false; message: string }>;
  setSpinResult: (result: SpinResult) => void;
  proceedToCoin: () => void;
  reset: () => void;
}

const ExperienceContext = createContext<ExperienceValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>("splash");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [spinResult, setSpinResultState] = useState<SpinResult | null>(null);
  const [entering, setEntering] = useState(false);

  const enterTask = useCallback(async () => {
    setEntering(true);
    try {
      const { sessionId: newSessionId } = await startSession();
      setSessionId(newSessionId);
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      } catch {
        /* storage unavailable — session state still lives in React */
      }
      setStage("wheel");
      return { ok: true } as const;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start. Please try again.";
      return { ok: false, message } as const;
    } finally {
      setEntering(false);
    }
  }, []);

  const setSpinResult = useCallback((result: SpinResult) => {
    setSpinResultState(result);
  }, []);

  const proceedToCoin = useCallback(() => setStage("coin"), []);

  const reset = useCallback(() => {
    setSessionId(null);
    setSpinResultState(null);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setStage("splash");
  }, []);

  const value = useMemo<ExperienceValue>(
    () => ({
      stage,
      sessionId,
      spinResult,
      entering,
      enterTask,
      setSpinResult,
      proceedToCoin,
      reset,
    }),
    [stage, sessionId, spinResult, entering, enterTask, setSpinResult, proceedToCoin, reset],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside ExperienceProvider");
  return ctx;
}
