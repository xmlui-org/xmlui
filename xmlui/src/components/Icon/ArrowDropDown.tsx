import styles from "./ArrowDropDown.module.scss";
import Arrow from "./svg/arrow-dropdown.svg?react"
import type {IconBaseProps} from "./IconReact";

export const ArrowDropDown = (props: IconBaseProps) => (<Arrow  className={styles.arrowDropDown} {...props} />);
