# 0001 — Zustand persist + Set serialisation

- **Status:** Accepted · 2026-05-21
- **Touches:** `src/state/sessionStore.ts`

## Context

`sessionStore.completedScreens` is naturally a `Set<ScreenId>` — set semantics
(membership, idempotent add) are what F1 phase gating reads from. But Zustand's
`persist` middleware serialises to localStorage via `JSON.stringify`, and JSON
does not handle `Set` (it becomes `{}` on round-trip and the gate breaks).

The plan in `docs/ARCHITECTURE.md` calls for two localStorage-persisted Zustand
stores and an F1 gate that reads `completedScreens`. It doesn't say how to
handle the Set/JSON mismatch.

## Decision

Use Zustand `persist`'s `partialize` + `merge` hooks to round-trip the Set
through an array:

```ts
partialize: (s): SerializedState => ({
  …,
  completedScreensList: Array.from(s.completedScreens),
  …,
}),
merge: (persisted, current): SessionState => ({
  …current,
  …(persisted ?? {}),
  completedScreens: new Set<ScreenId>(persisted?.completedScreensList ?? []),
}),
```

In-memory shape stays a `Set`; only the localStorage representation is an
array. Consumers (`isPhase1Complete`, `resolveNavigation`) keep using the Set
API.

## Alternatives considered

- **Keep `completedScreens` as an array everywhere.** Membership checks would
  become `.includes()` (O(n)) and add becomes a "dedupe then push" idiom every
  time. Worse ergonomics; same persistence story.
- **Custom Zustand storage with a JSON.stringify replacer/reviver.** Doable
  but you have to register Set as a known type across both directions for the
  whole store, which leaks the concern into every other field. `partialize` +
  `merge` keeps the conversion local to this one field.
- **Use a different library (immer, valtio).** Out of plan scope. Zustand was
  locked in `docs/ARCHITECTURE.md` proposal (c).

## Consequences

- The persisted JSON for `pvacf:session` has a `completedScreensList: string[]`
  field; in-memory the same data is `completedScreens: Set<ScreenId>`. Tests
  and consumers always touch the Set.
- If we ever add another Set-shaped field, repeat this pattern (one array
  alias per Set). Two helpers (`partialize`/`merge`) handle both. No need to
  generalise until we have a third Set.
- `merge` runs on hydrate; the shape contract between `partialize` (write)
  and `merge` (read) must stay in sync. Both live in the same file to make
  drift obvious.
