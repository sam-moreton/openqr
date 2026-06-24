/**
 * Analytics injection point for the OpenQR tool.
 *
 * The open-source tool ships ZERO tracking by default — `trackEvent` is a no-op.
 * A host application (e.g. the OpenQR site) may inject its own handler via
 * `setTrackHandler` to receive anonymous UI events (payload type, export format,
 * etc.). The tool never sends the *content* of a QR code anywhere.
 */

export type TrackHandler = (action: string, name?: string, category?: string) => void;

let handler: TrackHandler | null = null;

/** Host apps call this once to receive tool events. Pass null to disable. */
export function setTrackHandler(fn: TrackHandler | null): void {
  handler = fn;
}

/** Fire an anonymous UI event. No-op unless a host has injected a handler. */
export function trackEvent(action: string, name?: string, category = "QR"): void {
  if (typeof window === "undefined" || !handler) return;
  try {
    handler(action, name, category);
  } catch {
    /* never let analytics break the tool */
  }
}
