"use client";

import { useRef, useState } from "react";
import { Check, ImageUp, Info, Link as LinkIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQrStore } from "@/lib/store";
import { encodeConfig } from "@/lib/config-url";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from "@/lib/qr/options";

const LOGO_ACCEPT = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Info icon that opens on hover (desktop) and tap/click (touch). */
function InfoHint({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-full"
      >
        <Info className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-64 p-3 text-xs leading-relaxed text-muted-foreground"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

function ShareButton() {
  const [done, setDone] = useState(false);
  const onShare = async () => {
    const st = useQrStore.getState();
    const cfg = encodeConfig({ input: st.input, override: st.override, structured: st.structured, values: st.values, style: st.style });
    const url = `${window.location.origin}/#${cfg}`;
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("share_design", undefined, "Support");
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      window.prompt("Copy your share link:", url);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={onShare} className="w-full">
      {done ? <Check className="text-primary" /> : <LinkIcon />}
      {done ? "Link copied" : "Copy a link to this design"}
    </Button>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-0.5"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs uppercase" />
      </div>
    </div>
  );
}

const DOT_TYPES: DotType[] = ["square", "dots", "rounded", "classy", "classy-rounded", "extra-rounded"];
const CORNER_SQUARE: CornerSquareType[] = ["square", "dot", "extra-rounded"];
const CORNER_DOT: CornerDotType[] = ["square", "dot"];
const EC: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

export function StylePanel() {
  const style = useQrStore((s) => s.style);
  const setStyle = useQrStore((s) => s.setStyle);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const onLogo = (file: File | undefined | null) => {
    if (!file) return;
    if (!LOGO_ACCEPT.includes(file.type)) {
      setLogoError("Unsupported file. Use PNG, JPG, SVG or WebP.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError("File too large — keep it under 2 MB.");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => setStyle({ logo: String(reader.result) });
    reader.readAsDataURL(file);
    trackEvent("logo_added", undefined, "Style");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onLogo(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Colours</h3>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Foreground" value={style.fgColor} onChange={(v) => setStyle({ fgColor: v })} />
          <ColorField label="Background" value={style.bgColor} onChange={(v) => setStyle({ bgColor: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="transparent">Transparent background</Label>
          <Switch id="transparent" checked={style.transparent} onCheckedChange={(c) => setStyle({ transparent: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="gradient">Gradient</Label>
          <Switch id="gradient" checked={style.useGradient} onCheckedChange={(c) => setStyle({ useGradient: c })} />
        </div>
        {style.useGradient && (
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Gradient colour" value={style.gradientColor} onChange={(v) => setStyle({ gradientColor: v })} />
            <div className="space-y-1.5">
              <Label>Style</Label>
              <Select value={style.gradientType} onValueChange={(v) => setStyle({ gradientType: v as "linear" | "radial" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* Shape */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shape</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Dots</Label>
            <Select value={style.dotType} onValueChange={(v) => setStyle({ dotType: v as DotType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOT_TYPES.map((t) => <SelectItem key={t} value={t}>{cap(t)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Corner</Label>
            <Select value={style.cornerSquareType} onValueChange={(v) => setStyle({ cornerSquareType: v as CornerSquareType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CORNER_SQUARE.map((t) => <SelectItem key={t} value={t}>{cap(t)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Corner dot</Label>
            <Select value={style.cornerDotType} onValueChange={(v) => setStyle({ cornerDotType: v as CornerDotType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CORNER_DOT.map((t) => <SelectItem key={t} value={t}>{cap(t)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Logo</h3>
          <InfoHint label="Logo file requirements">
            <p className="mb-1.5 font-medium text-foreground">Logo requirements</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>PNG, JPG, SVG or WebP</li>
              <li>Max 2 MB</li>
              <li>Square works best; a transparent PNG looks cleanest</li>
              <li>Keep it small — large logos can stop the code scanning</li>
            </ul>
          </InfoHint>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={LOGO_ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => {
            onLogo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {style.logo ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-2 transition-colors",
              dragging && "border-primary bg-accent"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={style.logo} alt="logo" className="h-10 w-10 rounded border object-contain" />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStyle({ logo: null })}>
              <X className="h-4 w-4" /> Remove
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              dragging ? "border-primary bg-accent" : "border-input hover:border-primary/60 hover:bg-accent/50"
            )}
          >
            <ImageUp className={cn("h-6 w-6", dragging ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-medium">
              {dragging ? "Drop to upload" : "Drag & drop a logo, or click to browse"}
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP · max 2 MB</span>
          </button>
        )}

        {logoError && <p className="text-xs text-destructive">{logoError}</p>}

        {style.logo && (
          <div className="space-y-1.5">
            <Label>Logo size — {Math.round(style.logoSize * 100)}%</Label>
            <Slider min={0.1} max={0.5} step={0.01} value={[style.logoSize]} onValueChange={([v]) => setStyle({ logoSize: v })} />
          </div>
        )}
      </section>

      {/* Advanced */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Advanced</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Error correction</Label>
            <Select value={style.errorCorrectionLevel} onValueChange={(v) => setStyle({ errorCorrectionLevel: v as ErrorCorrectionLevel })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EC.map((t) => <SelectItem key={t} value={t}>{t} {EC_LABEL[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Margin — {style.margin}px</Label>
            <Slider min={0} max={40} step={1} value={[style.margin]} onValueChange={([v]) => setStyle({ margin: v })} />
          </div>
        </div>
      </section>

      {/* Frame */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frame</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="frame">Add a “Scan me” frame</Label>
          <Switch
            id="frame"
            checked={style.frameEnabled}
            onCheckedChange={(c) => {
              setStyle({ frameEnabled: c });
              if (c) trackEvent("frame_enabled", undefined, "Style");
            }}
          />
        </div>
        {style.frameEnabled && (
          <div className="space-y-1.5">
            <Label htmlFor="frame-text">Caption</Label>
            <Input id="frame-text" value={style.frameText} onChange={(e) => setStyle({ frameText: e.target.value })} maxLength={24} />
          </div>
        )}
      </section>

      <section className="border-t pt-4">
        <ShareButton />
      </section>
    </div>
  );
}

const EC_LABEL: Record<ErrorCorrectionLevel, string> = { L: "(7%)", M: "(15%)", Q: "(25%)", H: "(30%)" };
const cap = (s: string) => s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
