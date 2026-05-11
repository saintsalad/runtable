---
name: runtable-ui-pattern
description: Implement and refactor RunTable UI/features using this repository's established patterns: Expo Router thin routes, feature-first modules, NativeWind semantic theming, Zustand for session UI state, React Query for server state, receipt-first social UX, and strict TypeScript. Use when adding screens/components/hooks, polishing UI, or aligning code to current app design conventions.
---

# RunTable UI Pattern

## Apply This Skill When

- Building or refactoring screens, components, hooks, stores, or UI flows in this repo.
- User asks to "match current design pattern", "follow existing style", "keep consistency", or "polish UI".
- Work touches routing, theming, live/lobby interactions, receipts, map-first home, or session controls.

## Non-Negotiable Defaults

1. Keep route files in `app/` thin; orchestration only.
2. Place feature logic in `features/<feature>/` (`components/`, `hooks/`, `store/`, `types/`, `utils/`) when scope is feature-specific.
3. Use strict TypeScript; no `any`; avoid untyped JSON at boundaries.
4. Use NativeWind classes first; avoid `StyleSheet.create` unless NativeWind cannot express the case.
5. Use `useSemanticTheme()` / theme tokens for colors; avoid ad-hoc hex colors.
6. Treat RunTable as social realtime + shareable receipts, not a fitness analytics dashboard.

## Product Intent Guardrails

- Prioritize coordination, presence, and memorable artifacts.
- Emphasize host vs participant clarity in session controls.
- Keep UI premium but restrained: thermal/receipt aesthetics, clean hierarchy, minimal clutter.
- Prefer share-ready outputs and collectible-feeling receipt experiences over dense metrics.

## Architecture Rules

- **Routes (`app/`)**: compose views + hooks; no large business logic blocks.
- **Reusable UI (`components/`)**: shared primitives and cross-feature components.
- **Feature code (`features/`)**: colocate non-global concerns.
- **Global cross-cutting state (`store/`)**: only for concerns truly spanning features.
- **Pure helpers (`lib/`)**: deterministic logic and mappers.
- **Typed contracts (`types/`)**: shared unions/interfaces and stable app contracts.

## State Ownership

- Use **Zustand** for UI/session/runtime state (role toggles, ephemeral run state, local interaction state).
- Use **React Query** for server entities and cached async data.
- Do not mirror server entities into Zustand if React Query already owns them.
- Use narrow selectors to avoid hot-tree rerenders.

## Styling & Theming

- Use semantic tokens (`background`, `surface`, `card`, `text`, `muted`, `faint`, `border`, `receiptPaper`, `thermalInk`) through theme hooks/providers.
- Keep touch targets at least ~44pt.
- Keep separators low-contrast and spacing generous.
- Avoid Android-default visual widgets; preserve app identity.
- Use monospace typography patterns already present for tactical/receipt chrome.

## Motion & Interaction

- Use Reanimated for non-trivial motion; avoid legacy Animated for complex behavior.
- Motion should be smooth and purposeful, not decorative noise.
- Use subtle haptics only on key confirmations/errors.
- For long lists, use FlashList with stable keys and memoized rows.

## Session UX Conventions

- Keep host session lifecycle separate from participant personal run lifecycle.
- Host controls: session lifecycle utilities (start/cancel/close, room-level controls).
- Participant controls: finish personal run, leave session, view live stats.
- Closed sessions become read-only with clear archived messaging and receipt continuation path.
- Use explicit permission helpers for control gating; avoid scattered role checks.

## Receipt & Share Conventions

- Receipts are first-class surfaces; keep layouts modular and reusable.
- Use receipt-specific primitives/components instead of giant one-off JSX.
- For share mode, isolate paper framing and keep action hooks replaceable for real native integrations later.
- Participant rows may include thermal portraits when available.

## Map/Home Conventions

- Home is map-first where applicable; cards/sheets are secondary context.
- Keep map chrome theme-aware and atmosphere-aware (day phase/weather mock inputs).
- Use existing route/listing data hooks and store actions for join flow wiring.

## Implementation Checklist (Run Every Time)

- [ ] Route file remains thin and typed.
- [ ] New logic is placed in feature/shared module with clear ownership.
- [ ] Colors come from semantic theme tokens (no random hex sprawl).
- [ ] Host vs participant permissions are explicit and correct.
- [ ] Components are split when file grows too large or mixes concerns.
- [ ] List rows and callbacks are stable in hot paths.
- [ ] TypeScript and lint pass after edits.

## Validation Commands

Run after substantive changes:

```bash
npx tsc --noEmit
npx expo lint
```

If adding an Expo native module:

```bash
npx expo prebuild
```

Then run platform/dev build (`npx expo run:ios` or `npx expo run:android`) when native linking is required.
