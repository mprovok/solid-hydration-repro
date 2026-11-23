import { MaterialNavigationRailMenuButton } from "./MaterialNavigationRailMenuButton.jsx";
import { Show, createMemo } from "solid-js";
import styles from "./MaterialNavigationRail.module.css";

const MaterialNavigationRail = (props) => {
	let refList;
	const isExpanded = createMemo((prev) => props.show || prev === void 0 ? Boolean(props.expanded) : prev);
	const isModal = createMemo((prev) => props.show || prev === void 0 ? Boolean(props.modal) : prev);
	const isCenter = createMemo((prev) => props.show || prev === void 0 ? Boolean(props.center) : prev);
	const isHideWhenCollapsed = createMemo((prev) => props.show || prev === void 0 ? Boolean(props.hideWhenCollapsed) : prev);
	const hasMenuButton = () => props.menuButton !== void 0;
	const isHiddenWhenCollapsed = createMemo(() => hasMenuButton() && isModal() && isHideWhenCollapsed());
	const isVisuallyExpanded = createMemo(() => isExpanded() || isHiddenWhenCollapsed());
	return <sm-navigation-rail role="navigation" aria-label={props.ariaLabel} class={styles["container"]} data-modal={isModal()} data-center={isCenter()} data-always-expanded={isHiddenWhenCollapsed()} data-show={isExpanded() && isHiddenWhenCollapsed()}>
      <div class={styles["rail-container"]}>
        <div class={styles["rail"]} data-expanded={isVisuallyExpanded()}>
          <md-elevation></md-elevation>
          <div class={styles["menu-fab"]}>
            <Show when={hasMenuButton()}>
              <MaterialNavigationRailMenuButton {...props.menuButton} expanded={isExpanded()} onClick={props.onClickMenuButton} />
            </Show>
          </div>
          <div class={styles["center-items"]}>
            <div ref={refList} tabindex={-1} role="menubar" aria-orientation="vertical" class={styles["items"]}>
            </div>
          </div>
        </div>
      </div>
    </sm-navigation-rail>;
};
export { MaterialNavigationRail };

