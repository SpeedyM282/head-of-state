# CLAUDE.md — «Президент» (political satire sim, Plague Inc.-like)

Solo developer project. Stack: React 18 + TypeScript (strict) + Vite + Zustand + Tailwind + Vitest + Capacitor (Android first).
Full design: see GDD.md. Full architecture: see ARCHITECTURE.md. Read both before large tasks.

## Game in one paragraph

Player picks a country on a map before the game starts — the fictional Absurdistan or one of ~18 real European countries, each with a real-world-derived profile (economy/corruption/democracy/development levels) that shapes the starting stats and governance vector. 7 stats (0-100): Economy, Treasury, Approval, Elite Loyalty, Stability, Development, Corruption. Corruption is the one INVERTED stat (higher is worse) — it skims treasury income, drags development, grows on its own (faster under totalitarianism), and above ~50 buys elite loyalty; it is never a defeat condition by itself. High Economy (>70) earns a prosperity bonus to income, which Corruption is the intended counterweight to. A Governance Vector scale (0-100: democracy → totalitarianism) shifts as a consequence of player choices and changes game rules per zone. Real-time, Plague Inc. style: time auto-advances (1 tick = 1 game month; normal 20s / fast 10s per month, plus pause) and the player buys reforms / answers events while the clock runs — no "next turn" button. Events and the open reforms panel auto-pause the clock (manual pause wins). Each tick → stats interact → win/lose checks. The clock lives in the store; `core` stays pure and turn-based. Play runs in 48-month terms with an election at the end of each (zone bends the result: democratic by a strict approval bar, authoritarian with «админресурс», totalitarian a 99.7% formality that costs reputation). Win the election → next term (inter-term inauguration screen; stats carry over); lose → 'elections' defeat. The constitution allows 2 terms — then amend it (open-ended play with per-term escalation so games still terminate) or step down. Stepping down is VICTORY, the canonical good ending («Ушёл непобеждённым»). 4 defeats: coup, revolution, default, lost elections. Tone: ironic satire, no real politicians/countries.

## Architecture invariants (never violate)

1. **`src/core/` is pure.** No imports from ui/store/data, no React, no DOM, no side effects, no `Math.random()`, no `Date.now()`. Randomness only via the seeded `rng` parameter. If a core change needs something from outside — pass it as a parameter.
2. **Dependency direction:** `ui → store → core`. Content from `data/` is injected into core as the `GameContent` parameter, never imported by core directly.
3. **`GameState` is a plain serializable object.** No classes, functions, Dates, Maps inside state.
4. **Determinism:** same seed + same actions = identical outcome. There is a test for this; keep it green.
5. **All balance coefficients live in `data/balance.ts`**, each with a comment. No magic numbers in core formulas.
6. **Content is declarative data** (effects as `{ target, delta }` arrays). Game logic never hardcodes specific reforms/events.

## Code rules

- TypeScript strict; no `any`, no `as` casts to silence errors. Prefer discriminated unions for events/actions.
- Named exports only. File names: camelCase for modules, PascalCase for components.
- UI components contain zero game logic — no stat math in JSX or hooks; they render store state and dispatch store actions.
- Tailwind for styling; no UI kit libraries (no Ant Design/MUI). Custom components only.
- Do not add dependencies without asking. The intended full list: zustand, @capacitor/core, @capacitor/preferences. Dev: vitest, typescript, vite, tailwind.
- Comments and code identifiers in English. User-facing text is localized: content (reforms/events/countries) carries `LocalizedText` (`{ en, ru, uz }`) inline in `data/`; fixed UI strings live in `src/i18n/{en,ru,uz}.ts`. Never add a bare string where a `LocalizedText` is expected — all three languages, always.

## Testing rules

- Every core function gets unit tests in the same PR/commit as the function.
- After touching `tick`, `effects`, `conditions`, `vector`, or `balance.ts`: run the full test suite including `autoplayer.test.ts` and report the outcome stats (defeat share, avg game length) in your summary.
- Never weaken or delete the determinism test.

## Workflow

- Work in small increments; after each task run `yarn typecheck` and `yarn test` before declaring done.
- When implementing from GDD, follow it exactly; if the GDD is ambiguous or seems wrong — stop and ask, do not invent mechanics silently.
- When changing balance: change only `data/balance.ts` or content files, then re-run the autoplayer and show before/after stats.
- Keep GDD.md/ARCHITECTURE.md updated when the user approves a design change; note the change in the file's version line.

## Out of scope for MVP (do not build even if it seems easy)

Multiplayer/networking, diplomacy simulation, war system, achievements, monetization, iOS build, sound.
