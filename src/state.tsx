import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Action, type Dataset } from "./domain";
import { createRepository } from "./repository";
interface Workspace {
  data: Dataset | null;
  loadError: string | null;
  loading: boolean;
  busy: boolean;
  toast: string;
  dispatch(action: Action, message?: string): boolean;
  reset(): boolean;
  retry(): void;
}
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset | null>(null);
  const current = useRef<Dataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const repository = useCallback(
    () =>
      createRepository({
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
      }),
    [],
  );
  const retry = useCallback(() => {
    setLoading(true);
    try {
      const value = repository().load();
      current.current = value;
      setData(value);
      setLoadError(null);
    } catch (error) {
      setLoadError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [repository]);
  useEffect(() => {
    const timer = window.setTimeout(retry, 0);
    return () => window.clearTimeout(timer);
  }, [retry]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  function dispatch(action: Action, message = "Saved to this browser") {
    if (!current.current) return false;
    setBusy(true);
    try {
      const value = repository().commit(current.current, action);
      current.current = value;
      setData(value);
      setToast(message);
      return true;
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setBusy(true);
    try {
      const value = repository().reset();
      current.current = value;
      setData(value);
      setLoadError(null);
      setToast("A fresh start. Sample workspace restored.");
      return true;
    } finally {
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{ data, loading, loadError, busy, toast, dispatch, reset, retry }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace provider is missing.");
  return context;
}
