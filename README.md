# solid-js 2.0.3/2.0.4 hydration repro: server/client key-sequence drift leaves interactive elements permanently dead after hydration

Standalone reproduction of a hydration bug in solid-js (with `@solidjs/web`
and `@solidjs/vite-plugin`, SSR + hydration mode). Found on solid-js 2.0.3;
re-verified byte-identical on 2.0.4 (current release line). It renders the
**real component tree from the app where the bug was found** (a
web-component-based component library's navigation rail): the component
sources are copied and minimally adapted, using the real
`@solid-primitives` packages; only the Lit element package (`@material/web`)
and the two svg menu icons are replaced by inert stubs. Independent pnpm
project with its own lockfile.

## What you see

The rail's menu button (top of the rail) server-renders fine, hydrates into
a **detached clone**, and the visible server-rendered button keeps **no
event handler — clicking it does nothing, in dev and in production, on
every load**.

`pnpm dev` → open the page → the dev-server console shows, on every load:

- 5 `Hydration key miss` warnings — the client looks up keys like `19h0`
  while the server emitted `19e0` for the same element
  (`curl -s http://localhost:5173/ | grep -o '_hk=19e0'`),
- **`Hydration completed with 5 unclaimed server-rendered node(s)`**
  listing the entire menu-button chain — `sm-icon-button`,
  `button[role="switch"]`, `md-elevation`, `md-icon`, `svg` — the whole
  interactive subtree stays unclaimed while the client renders a detached
  clone of it (4 `template()` fallback creations).

`pnpm build && pnpm preview` → identical outcome, **silent**: zero warnings
(all checks are dev-only), but the same detached clones are created, the
same server nodes stay unclaimed, and the visible menu button is equally
dead.

Quick check in the browser console after hydration:

```js
const btn = document.querySelector("sm-navigation-rail sm-button");
btn.closest("sm-icon-button").getAttribute("_hk"); // "19e0" — the server node, still in the document
typeof btn._$$click;       // "undefined" — no delegated click handler
btn.querySelector("button[role=switch]").getAttribute("aria-checked"); // "false"
btn.click();               // nothing happens
```

Deterministic: verified 3/3 fresh loads in dev and 3/3 in production on
both 2.0.3 and 2.0.4.

## The bug

solid-js' **server** build consumes hydration ids in places where the client
never does, so the server's id sequence drifts ahead of the client's. Three
server/client asymmetries:

1. **`<Show>`** — the server build reserves a child id unconditionally for
   non-keyed `Show` (`if (o?.id != null && !props.keyed) getNextChildId(o);`);
   the client allocates nothing. This includes `Show`s whose condition is
   false at SSR time (nothing is rendered, but the id is still consumed).
2. **Scope slots** — `ssrScope` / `_scopeSlot` / `materializeId` exist only
   in the server build; `{props.children}` / JSX-prop slots consume hidden
   ids server-side with no client counterpart.
3. **`onSettled`** — the server build is a reservation-only stub
   (`function onSettled(cb) { const o = getOwner(); if (o?.id != null)
   getNextChildId(o); }` — consumes an id, never runs the callback), while
   the client runs the callback in a tracked effect and consumes nothing.

This repro reproduces the death through **1 and 2 alone**: the interactive
element arrives as a JSX prop rendered inside `<Show>` (the rail's
menu-fab region), and its chain adds more `<Show>`s (tooltip content, icon,
label, outlined) and prop-slot renders. 3 is the same kind of asymmetry
(the app also registers viewport observers via `onSettled`) but is not
needed to reproduce.

## Why the repro uses the real component sources

Hand-written synthetic versions of this exact chain (~60 lines) produce the
same id divergence and `Hydration key miss` warnings, but **self-heal**:
after hydration, a later client render pass lands on the server nodes by
coincidence and the button starts working. The drift has to exceed what the
client's re-render passes can absorb — the real-shaped tree (tooltips,
custom-element wrappers, a `dynamic()` native button, nested `<Show>`s and
slots) crosses that threshold on every load, in dev and in prod. The death
is insensitive to tree size and content: the full navigation layout, the
rail alone, the rail with zero navigation items — all fail the same way.

Two structural properties surfaced while trimming the tree (both encoded in
its current shape, and each adaptation step verified hydration-protocol
neutral — fingerprints byte-identical):

- **A component boundary is itself a protocol participant.** Flattening a
  component into its parent merges its elements into the parent's template
  chunk and *drops* hydration-key reservations; plain nested elements in
  the same template don't. The button chain's boundaries were therefore
  inlined deliberately.
- **A keyed `<Show>` with function children consumes no server id when its
  condition is false** — unlike a non-keyed inline `<Show>`, which always
  reserves; the same holds for `<For>` with empty data, on both sides. Dead
  branches guarded by non-keyed `<Show>`s are kept verbatim for exactly
  that reason.

## The threshold: the unused tooltip boundary is load-bearing

In the shipped state the rail's `menuButton` carries only aria-labels, so
`MaterialTooltip`'s internal `<Show when={props.tooltip !== void 0}>` takes
its fallback — the two tooltip components render nothing extra, and the
served HTML contains **no tooltip markup at all**. They nonetheless keep
the whole chain dead: with the components present (rendering nothing),
5 hydration key misses, 5 unclaimed server nodes, 4 detached clones, dead
click; **with the components deleted** (`MaterialTooltip` +
`MaterialPlainTooltip` removed and their element unwrapped — nothing else
changes): 0 key misses, 0 clones — the menu button is interactive, in dev
and in production (re-verified on 2.0.4). The tooltip's component boundary
plus its internal non-keyed `<Show>` — one server-side id reservation and
one extra client template chunk — is exactly the accumulated headroom the
client's claim sequence needs. The repro ships the dead variant; the healed
variant differs only by the component deletion.

## Workaround

The app's own workaround: keep the `menuButton` out of the server render
and the hydration pass via an `onHydrationEnd`-mounted gate — the rail
hydrates fine and the button mounts live right after hydration. Verified in
this repo most recently on 2.0.4 (gate 2/2 dev, 2/2 prod, click toggles;
shipped-state fingerprint byte-identical before/after). The gate ships as
commented-out lines in `src/App.tsx`: uncomment the `mounted` signal +
`onHydrationEnd` effect and swap the two `menuButton` lines to watch the
button come alive. It's a workaround, not a fix — claiming with the
server's id protocol remains broken.

## Structure

- `src/App.tsx` — renders the real `MaterialNavigationRail` with a
  `menuButton` prop carrying aria-labels rather than tooltip titles (the
  death reproduces identically with tooltip titles; see "The threshold").
  The App owns the rail's `expanded` state and toggles it from the menu
  button click, like the real layout — on a healthy runtime a click widens
  the rail (136 → 400px), flips `aria-checked`/`data-expanded`, and swaps
  the icon.
- `src/material/` — the real component sources, minimally adapted:
  navigation-rail (rail + menu button, with `MaterialButton`,
  `MaterialIconButton` and `MaterialIcon` inlined), the tooltip wrapper +
  plain tooltip (inert in the shipped baseline but load-bearing for the
  death), and utils. Dead branches in JSX are kept on purpose (see "Why
  the repro uses the real component sources"); the stylesheets are merged
  one file per component family with never-matching rules removed.
- `src/stubs/` — inert replacements: `@material/web` side-effect imports
  aliased to empty modules (`md-*` elements stay unregistered), and the two
  menu svg icons as simple components. No component-library dependency; the
  `@solid-primitives/*` packages are the real ones at the app's versions.
- `src/app.css` — plain (non-module) visibility styles (surface colors for
  the rail column, the menu button and pill chips, `body { margin: 0 }`).
  Cosmetics only — no class names, no markup, no hydration-key effect.

## Run it

```sh
pnpm install
pnpm dev                    # http://localhost:5173 — warnings + dead button
pnpm build && pnpm preview  # silent — still dead
```

The menu button is the only `<sm-button>` in the document:
`document.querySelector("sm-navigation-rail sm-button")` is the dead
element.

## Notes

- Current baseline fingerprints for diffing (2.0.4): dev misses
  `19h0/19h20/19h24/19h270/19h2730` vs the server's `19e0/19e20/19e24/
  19e270/19e2730`; production key on the icon-button wrapper is
  `001008c1`.
- Production hides the warnings (they are dev-only) but the fallback
  behavior is identical: `getNextElement`'s miss path (`return
  template(true)` — a fresh detached element instead of claiming the server
  node) exists unchanged in the prod build; only the `console.warn`s are
  stripped.
