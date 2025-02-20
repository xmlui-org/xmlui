import type React from "react";
import { useId } from "react";
import styles from "./RadioGroup.module.scss";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import classnames from "classnames";

type Props = {
    value: string;
    style?: React.CSSProperties;
};

export const RadioItem = ({ value, style }: Props) => {
    const id = useId();

    return (
        <div key={id} className={styles.radioOptionContainer} style={style}>
            <InnerRadioGroup.Item className={classnames(styles.radioOption)} value={value} id={id}>
                <InnerRadioGroup.Indicator className={classnames(styles.indicator)} />
            </InnerRadioGroup.Item>
        </div>
    );
};
