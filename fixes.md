# Bretzel Defense Fix Plan

## Goal
Harden runtime correctness and make the architecture safer for future levels (Level02+), while keeping gameplay behavior stable.

## Priority Order
1. Stability hotfixes (high risk bugs)
2. Lifecycle unification (single despawn path)
3. Event architecture hardening
4. Automated test baseline
5. Level factory for multi-level scalability

## Phase 1 - Stability Hotfixes

### 1) Untrack creeps on success
- Problem: `creep.succeeded` currently removes the display object but may leave stale references in melee/spatial structures.
- Files:
  - `jeu/src/System/MoveCreeps.js`
  - `jeu/src/Stage/LevelRuntime/registerGameStateEvents.js`
  - `jeu/src/Stage/LevelRuntime/registerEntityLifecycleEvents.js`
- Fix:
  - Route succeeded creeps through the same untrack flow (`entity.untrack.batch`) before removal.
  - Ensure no lingering engagements or spatial entries after path success.

### 2) Fix `SpatialHash.remove` for cell index 0
- Problem: falsy check treats cell `0` as missing.
- File:
  - `jeu/src/Utils/spatialhash.js`
- Fix:
  - Replace `if(!gridcell)` with explicit undefined/null check.

### 3) Stop runaway RAF loops on stage swap
- Problem: `GameStage.run()` schedules RAF recursively without a cancellation path.
- Files:
  - `jeu/src/Utils/bobo.js`
  - `jeu/src/index.js`
- Fix:
  - Store RAF id on stage, add `stop()`/`destroy()` cancellation, call it before swap.

### 4) Preserve interval cadence across pause/resume
- Problem: paused intervals resume with mutated period (`remaining`) instead of original `delay`.
- File:
  - `jeu/src/Singleton/timers.js`
- Fix:
  - Resume intervals using original `delay`.
  - Keep timeout resume behavior as remaining delay.

### Phase 1 Acceptance
- No stale creeps in spatial hash after success/death.
- No duplicate game loops after repeated stage swaps.
- Timers keep expected interval frequency after pause/resume.
- `npm run build` passes.

## Phase 2 - Entity Lifecycle Unification

### 1) Introduce one despawn pipeline
- Add a single helper (runtime module) to process removal reasons (`death`, `success`, `sell`).
- Make it idempotent (`entity._despawned` guard) to avoid double-removal side effects.

### 2) Route all exits through it
- Tower sell, creep success, entity death all call the same despawn flow.
- Keep `entity.untrack.batch` and `entity.remove.batch` internals but centralize the call site.

### Phase 2 Acceptance
- Every entity exit path uses one function.
- Repeated despawn calls become no-op and do not throw.

## Phase 3 - Event Architecture Hardening

### 1) Add event constants
- Replace raw strings with constants (`EVENTS.GAME_WIN`, etc.).
- Reduce typo risk and improve refactor safety.

### 2) Gate event logging behind debug flag
- File:
  - `jeu/src/Singleton/eventbus.js`
- Only log emissions when `world.debug === true`.

### 3) Add listener disposers for runtime modules
- Each `register*Events` function returns a cleanup function to unregister handlers.
- Ensure stage teardown cannot leave leaked listeners.

### Phase 3 Acceptance
- No always-on event spam in normal mode.
- Event modules can be mounted/unmounted cleanly.

## Phase 4 - Test Baseline

### 1) Add lightweight unit tests (Vitest)
- Target invariants first:
  - Spatial hash remove works for cell 0.
  - Timer pause/resume keeps interval cadence.
  - Wave accounting emits one `game.win` only.
  - Succeeded creep path untracks then removes.

### 2) Add CI test step
- Keep build in CI and add tests before/after build as appropriate.

### Phase 4 Acceptance
- Tests cover critical regressions and run in CI.

## Phase 5 - Multi-Level Factory

### 1) Create `createLevelStage(config)`
- Extract Level01 orchestration into a reusable stage factory.
- Config includes: lanes, buildspots, wave schedule, balance, towers, asset references.

### 2) Keep Level01 as data + hooks
- `Level01/index.js` becomes a small config wrapper around the factory.

### Phase 5 Acceptance
- Adding Level02 requires mostly config/data, not duplicated wiring.

## Suggested Commit Strategy
1. `fix: stabilize despawn, spatial hash removal, timers, and stage RAF teardown`
2. `refactor: unify entity despawn pipeline`
3. `refactor: harden event contracts and cleanup`
4. `test: add runtime invariant coverage`
5. `refactor: introduce level stage factory for Level02`
