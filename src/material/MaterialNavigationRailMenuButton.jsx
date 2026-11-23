import { MaterialPlainTooltip } from "./MaterialPlainTooltip.jsx";
import { MaterialTooltip } from "./MaterialTooltip.jsx";
import { dynamic } from "@solidjs/web";
import { Show, children } from "solid-js";
import stylesButton from "./MaterialButton.module.css";
import stylesIconButton from "./MaterialIconButton.module.css";
import "@material/web/icon/icon.js";
import MenuIcon from "@solidmaterial/icons/400/outlined/menu.svg";
import MenuOpenIcon from "@solidmaterial/icons/400/outlined/menu_open.svg";
// MaterialIconButton, MaterialButton and MaterialIcon inlined. Their three
// component boundaries each put the chain's elements into the hydration-key
// protocol (like the Typography peel showed), so flattening removes those
// reservations. All component sources live flat in src/material/ (pure
// file moves; content untouched except import paths — the css-module
// class hashes were recomputed at flattening and again at the css merge,
// purely cosmetic, and are stable since). MaterialButton's
// never-passed prop plumbing (href/children/size/shape/variant …) is kept
// verbatim on purpose: the non-keyed <Show>s it guards still reserve
// server-side hydration ids even when false, so dropping the dead branches
// would change the id protocol under test. MaterialButton's icon-guard
// <Show when={props.icon}> is always-true at this usage (the icon element
// is a truthy constant) and is written as <Show when={true}> around an
// inline <Show when={props.expanded}> — the same composition the original
// compiled to. Attributes the original layer
// rendered from its own (empty) props context — md-icon's aria-hidden, the
// omitted slot/aria-label — are kept literal so the menu button's own
// ariaLabel prop doesn't leak into them.
const LABEL_ROLE = {
	"extra-small": "title",
	small: "title",
	medium: "title",
	large: "headline",
	"extra-large": "headline"
};
const LABEL_SIZE = {
	"extra-small": "small",
	small: "small",
	medium: "medium",
	large: "small",
	"extra-large": "large"
};
const toString = (value) => value ? "true" : "false";
const MaterialNavigationRailMenuButton = (props) => {
	let ref;
	let refButton;
	const size = () => props.size ?? "small";
	const labelContent = children(() => props.children);
	const label = () => props.expanded ? props.ariaLabelSelected : props.ariaLabel;
	const title = () => props.expanded ? props.titleSelected : props.title;
	const onContextMenu = (event) => {
		if (props.href === void 0) event.preventDefault();
	};
	const ButtonOrAnchor = dynamic(() => props.href === void 0 ? "button" : "a");
	return <MaterialTooltip variant="plain" tooltip={title() !== void 0 ? <MaterialPlainTooltip>{title()}</MaterialPlainTooltip> : void 0}>
      <sm-icon-button data-width="default" class={stylesIconButton["button"]}>
        <sm-button ref={ref} data-variant="text" data-size={size()} data-shape={props.shape} data-toggle={props.expanded !== void 0 ? props.expanded.toString() : void 0} data-position={props.iconPosition} class={stylesButton["button"]} onClick={(event) => props.onClick?.(event)} onContextMenu={onContextMenu}>
      <ButtonOrAnchor ref={refButton} disabled={props.disabled} type={props.type ?? "button"} href={props.href} target={props.target} download={props.download} state={props.transition !== void 0 ? JSON.stringify({ transition: props.transition }) : void 0} role={props.href === void 0 && props.expanded !== void 0 ? "switch" : void 0} aria-label={label() ?? title()} aria-expanded={props.ariaExpanded !== void 0 ? toString(props.ariaExpanded) : void 0} aria-checked={props.expanded !== void 0 ? toString(props.expanded) : void 0}>
        <md-elevation></md-elevation>
        <Show when={true}>
          <md-icon aria-hidden={true}>
            <Show when={props.expanded} fallback={<MenuIcon />}>
              <MenuOpenIcon />
            </Show>
          </md-icon>
        </Show>
        <Show when={labelContent()}>
          <div class={stylesButton["label"]}>
            <Show when={typeof labelContent() === "string"} fallback={labelContent()}>
              <span class={`md-typescale-${LABEL_ROLE[size()]}-${LABEL_SIZE[size()]}`}>{labelContent()}</span>
            </Show>
          </div>
        </Show>
        <Show when={props.variant === "outlined"}>
          <div class={stylesButton["outline"]} />
        </Show>
      </ButtonOrAnchor>
    </sm-button>
  </sm-icon-button>
    </MaterialTooltip>;
};
export { MaterialNavigationRailMenuButton };
