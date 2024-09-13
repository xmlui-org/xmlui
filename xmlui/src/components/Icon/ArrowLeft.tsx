import styles from "./ArrowLeft.module.scss";
import Arrow from "./svg/arrow-left.svg?react";
import type {IconBaseProps} from "./IconNative";

export const ArrowLeft = (props: IconBaseProps) => (
  <Arrow className={styles.arrowLeft} {...props}/>
);
