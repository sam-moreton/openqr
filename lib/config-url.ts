import type { FieldValues, PayloadType } from "@/lib/payloads";
import { DEFAULT_STYLE, type QrStyle } from "@/lib/qr/options";
import type { SmartType } from "@/lib/detect";

export interface ShareableConfig {
  input: string;
  override: SmartType | null;
  structured: PayloadType | null;
  values: Record<PayloadType, FieldValues>;
  style: QrStyle;
}

/** Encode config to a URL-safe base64 string for the location hash (logo omitted — too large). */
export function encodeConfig(cfg: ShareableConfig): string {
  const json = JSON.stringify({
    i: cfg.input,
    o: cfg.override,
    st: cfg.structured,
    v: cfg.values,
    s: { ...cfg.style, logo: null },
  });
  return base64UrlEncode(json);
}

/** Only allow safe CSS colour syntax — blocks injection into exported SVG markup. */
const SAFE_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\)|[a-zA-Z]{1,20})$/;
const safeColor = (v: unknown, fallback: string) =>
  typeof v === "string" && SAFE_COLOR.test(v.trim()) ? v.trim() : fallback;

export function decodeConfig(hash: string): Partial<ShareableConfig> | null {
  try {
    const obj = JSON.parse(base64UrlDecode(hash));
    if (!obj || typeof obj !== "object") return null;
    const s = { ...DEFAULT_STYLE, ...obj.s, logo: null };
    s.fgColor = safeColor(s.fgColor, DEFAULT_STYLE.fgColor);
    s.bgColor = safeColor(s.bgColor, DEFAULT_STYLE.bgColor);
    s.gradientColor = safeColor(s.gradientColor, DEFAULT_STYLE.gradientColor);
    return {
      input: typeof obj.i === "string" ? obj.i : "",
      override: obj.o ?? null,
      structured: obj.st ?? null,
      values: obj.v,
      style: s,
    };
  } catch {
    return null;
  }
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
