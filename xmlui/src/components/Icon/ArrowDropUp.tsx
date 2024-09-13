import styles from "./ArrowDropUp.module.scss";
import Arrow from "./svg/arrow-up.svg?react";
import type {IconBaseProps} from "./IconNative";

export const ArrowDropUp = (props: IconBaseProps) => (<Arrow className={styles.arrowDropUp} {...props}/>);
