import { wrapComponent } from "../../runtime/rendering/adapter";
import { LiveRegionMd, defaultProps } from "./LiveRegion";
import styles from "./LiveRegion.module.scss";

export const liveRegionRenderer = wrapComponent({
  name: "LiveRegion",
  metadata: LiveRegionMd,
  renderer: ({ adapter }) => {
    const politeness = adapter.stringProp("politeness", defaultProps.politeness) === "assertive"
      ? "assertive"
      : "polite";
    const message = adapter.stringProp("message", "") ?? "";
    return (
      <div
        {...adapter.rootAttrs()}
        className={`${adapter.className} ${styles.liveRegion}`}
        role={politeness === "assertive" ? "alert" : "status"}
        aria-live={politeness}
        aria-atomic="true"
      >
        {message}
      </div>
    );
  },
});
