// hooks/useAutoSave.ts
"use client";

import { useEffect, useRef, useCallback } from "react";

export function useAutoSave(
  callback: () => Promise<void> | void,
  deps: any[],
  delay: number = 2000,
) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const save = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      savedCallback.current();
    }, delay);
  }, [delay]);

  // call save whenever deps change
  useEffect(() => {
    save();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);

  return { save };
}
