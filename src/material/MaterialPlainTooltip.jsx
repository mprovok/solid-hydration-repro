import styles from "./MaterialTooltip.module.css";

const MaterialPlainTooltip = (props) => {
	return <sm-plain-tooltip role="tooltip" class={styles["content"]}>
      <span class="md-typescale-body-medium">
        {props.children}
      </span>
    </sm-plain-tooltip>;
};
export { MaterialPlainTooltip };
