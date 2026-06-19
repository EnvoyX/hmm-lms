// components/RegisterSW.tsx
"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/worker/index.js");
    }
  }, []);

  return null;
}