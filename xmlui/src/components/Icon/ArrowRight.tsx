import styles from "./ArrowRight.module.scss";
import Arrow from "./svg/arrow-right.svg?react";
import type {IconBaseProps} from "./IconNative";

export const ArrowRight = (props: IconBaseProps) => (<Arrow className={styles.arrowRight} {...props} />);
