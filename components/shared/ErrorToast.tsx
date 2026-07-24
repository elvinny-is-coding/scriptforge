// components/shared/ErrorToast.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ErrorToast({ message }: { message: string | null }) {
  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);
  return null;
}
