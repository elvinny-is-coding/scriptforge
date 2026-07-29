// hooks/useAutoSave.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export function useAutoSave(
  callback: () => Promise<void> | void,
  deps: any[],
  delay: number = 5000,
) {
  const [isSaving, setIsSaving] = useState(false);
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const save = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      // Start the actual save
      setIsSaving(true);
      try {
        const result = savedCallback.current();
        if (result instanceof Promise) {
          await result;
        }
      } finally {
        setIsSaving(false);
      }
    }, delay);
  }, [delay]);

  // Call save whenever deps change
  useEffect(() => {
    save();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsSaving(false); // cleanup on unmount
    };
  }, deps);

  return { save, isSaving };
}
