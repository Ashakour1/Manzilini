import { useEffect } from "react";

/** Runs a callback on mount. Use with useCallback for the load function. */
export function useLoad(load: () => void | Promise<void>) {
  useEffect(() => {
    load();
  }, [load]);
}
