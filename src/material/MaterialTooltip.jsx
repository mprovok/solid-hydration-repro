import { createDebouncedMemo } from "./utils.jsx";
import { Show, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";
import { createFocusSignal } from "@solid-primitives/focus";
import styles from "./MaterialTooltip.module.css";

const MaterialTooltip = (props) => {
	const [refAnchor, setRefAnchor] = createSignal();
	let refTooltip;
	const isPersistentOnMount = () => props.persistent === "mount" && props.variant === "rich";
	const isPersistentOnClick = () => props.persistent === "click" && props.variant === "rich";
	const isPersistent = createMemo(() => props.persistent !== void 0 && props.variant === "rich");
	const [isOpen, setIsOpen] = createSignal(() => isPersistentOnMount());
	const [shouldOpen, setShouldOpen] = createSignal(() => ({
		open: isPersistentOnMount(),
		immediately: false
	}));
	const [isHoveringOverTooltip, setIsHoveringOverTooltip] = createSignal(false);
	const [isClicking, setIsClicking] = createSignal(false);
	const isAnchorFocused = createFocusSignal(() => refAnchor());
	createEffect(() => {
		const { open: isShouldOpen, immediately } = shouldOpen();
		return [
			isShouldOpen,
			immediately,
			isOpen(),
			isClicking(),
			isHoveringOverTooltip()
		];
	}, ([isShouldOpen, immediately, isOpen, isClicking, isHoveringOverTooltip]) => {
		if (immediately) setIsOpen(isShouldOpen);
		let timerId;
		if (!immediately) {
			if (isShouldOpen && !isOpen) timerId = setTimeout(() => setIsOpen(!isClicking), 450);
			else if (!isShouldOpen && isOpen && !isHoveringOverTooltip) timerId = setTimeout(() => setIsOpen(false), 1500);
		}
		return () => {
			clearTimeout(timerId);
		};
	});
	const isTooltipVisible = () => Boolean(void 0);
	const hasAnchorOrTooltipFocus = createDebouncedMemo(() => isAnchorFocused() && refAnchor()?.querySelector(":focus-visible") !== null, 50);
	createEffect(() => {
		return [(!isPersistent() || isOpen()) && hasAnchorOrTooltipFocus(), isTooltipVisible()];
	}, ([shouldBeVisible, isTooltipVisible]) => {
		if (shouldBeVisible !== isTooltipVisible) setShouldOpen({
			open: shouldBeVisible,
			immediately: true
		});
	});
	createEffect(() => isOpen() !== isTooltipVisible(), (shouldToggleVisibility) => {
		if (shouldToggleVisibility) {}
	});
	const onClick = () => {
		if (isPersistentOnClick()) setShouldOpen({
			open: true,
			immediately: true
		});
	};
	const onToggle = () => {
		setShouldOpen({
			open: isTooltipVisible(),
			immediately: true
		});
	};
	const onPointerEnterAnchor = () => {
		if (!isPersistent()) setShouldOpen({
			open: true,
			immediately: false
		});
	};
	const onPointerLeaveAnchor = () => {
		if (!isPersistent()) setShouldOpen({
			open: false,
			immediately: false
		});
	};
	const onPointerDownAnchor = () => {
		if (!isPersistent()) setIsClicking(true);
	};
	const onPointerUpAnchor = () => {
		if (!isPersistent()) {
			setIsClicking(false);
			setShouldOpen({
				open: false,
				immediately: false
			});
		}
	};
	const onPointerEnterTooltip = () => {
		if (!isPersistent()) setIsHoveringOverTooltip(true);
	};
	const onPointerLeaveTooltip = () => {
		if (!isPersistent()) setIsHoveringOverTooltip(false);
	};
	const tooltipId = createUniqueId();
	return <Show when={props.tooltip !== void 0} fallback={props.children}>
      {}
      <div ref={setRefAnchor} class={styles["anchor"]} aria-controls={tooltipId} onClick={onClick} onPointerEnter={onPointerEnterAnchor} onPointerLeave={onPointerLeaveAnchor} onPointerDown={onPointerDownAnchor} onPointerUp={onPointerUpAnchor}>
        {props.children}
        <sm-tooltip ref={refTooltip} class={styles["tooltip"]} data-variant={props.variant ?? "plain"} popover="auto" id={tooltipId} onToggle={onToggle} onPointerEnter={onPointerEnterTooltip} onPointerLeave={onPointerLeaveTooltip}>
          {props.tooltip}
        </sm-tooltip>
      </div>
    </Show>;
};
export { MaterialTooltip };

