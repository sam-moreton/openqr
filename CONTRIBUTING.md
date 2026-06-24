# Contributing to OpenQR

Thanks for your interest! OpenQR is a deliberately **simple, basic** QR code
generator. The aim is a clean, dependency-light, browser-only tool that anyone
can fork and self-host.

## Scope

This repository is the **basic open-source tool only**. It is intentionally
kept small. Larger features (APIs, server-side generation, analytics,
dynamic/short QR codes, accounts) are **out of scope** for this repo by design.

Good contributions:

- Bug fixes and accessibility improvements
- New static payload types (the encoding is local + standards-based)
- Export/quality fixes
- Performance, i18n, and documentation

## Ground rules

- Keep it **100% client-side** — no backend, no tracking, no telemetry. A core
  promise of OpenQR is that QR content never leaves the user's browser.
- **No watermarks, no paywalls, no feature gates.** Every feature stays free.
- No new heavy dependencies without discussion.
- Run `pnpm typecheck` and `pnpm build` before opening a PR.

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3011
```

## Licensing of contributions

By contributing, you agree that your contributions are licensed under the
project's **AGPL-3.0** license. Note that the maintainer retains the right to
offer the project under separate commercial terms (see NOTICE).
