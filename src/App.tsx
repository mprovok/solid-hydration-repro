import type { JSX } from "solid-js";
import { createSignal, onHydrationEnd } from "solid-js";
// App owns the rail's expanded state and toggles it from the menu button click,
// exactly like the real app's layout — so on a healthy runtime, clicking
// the menu button would flip aria-checked / data-expanded and widen the rail.
import { MaterialNavigationRail } from "./material/MaterialNavigationRail.jsx";
import "./stubs/custom-elements";
import "./app.css";

export default function App(): JSX.Element {
  const [expanded, setExpanded] = createSignal(false);
  //const [mounted, setMounted] = createSignal(false);
  //if (typeof window !== "undefined") onHydrationEnd(() => setMounted(true));
  return (
    <MaterialNavigationRail
      show={true}
      items={[]}
      ariaLabel="Primary"
      //menuButton={mounted() ? { ariaLabel: "Open menu", ariaLabelSelected: "Close menu" } : undefined}
      menuButton={{ ariaLabel: "Open menu", ariaLabelSelected: "Close menu" }}
      modal={false}
      hideWhenCollapsed={false}
      center={false}
      expanded={expanded()}
      onClickMenuButton={() => setExpanded((expanded) => !expanded)}
    >
      <main class="page">
        <h1>solid-js 2.0.3/2.0.4 hydration repro</h1>
        <p>The navigation rail's menu button (top of the rail) should be interactive after hydration: clicking it toggles the rail's expansion (width, aria-checked, icon). It doesn't — the click does nothing, on every load, in dev and production.</p>
      </main>
    </MaterialNavigationRail>
  );
}
