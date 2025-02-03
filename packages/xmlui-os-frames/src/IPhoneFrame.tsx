import styles from "./IPhoneFrame.module.scss";
import classNames from "classnames";
import type { ReactNode } from "react";
import { forwardRef } from "react";

export const IPhoneFrame = forwardRef(({ children }: {children: ReactNode}, ref) => {
  return (
    // simple wrapper, in case if it's in a flowlayout (the device width/height could be overwritten otherwise), temp
    <div>
      <div className={classNames(styles.device, styles.deviceIphone14Pro)} ref={ref as any}>
        <div className={styles.deviceFrame}>
          <div className={styles.deviceScreen}>
            {children}
          </div>
          {/*<img className="device-screen" src="assets/img/bg-iphone-14-pro.jpg" loading="lazy" />*/}
        </div>
        <div className={styles.deviceStripe}></div>
        <div className={styles.deviceHeader}></div>
        <div className={styles.deviceSensors}></div>
        <div className={styles.deviceBtns}></div>
        <div className={styles.devicePower}></div>
        <div className={styles.deviceHome}></div>
      </div>
    </div>
  );
});
