"use client";

import { useEffect } from "react";

/**
 * Debug page to test error boundaries.
 * Throws an error during render to trigger the nearest error.tsx.
 */
export default function DebugErrorPage() {
  useEffect(() => {
    // Some logs to help debugging the test itself
    console.log("DebugErrorPage mounting, about to crash...");
  }, []);

  throw new Error("Intentional debug crash");
}
