import { wrapComponent, createMetadata, parseScssVar } from "xmlui";
import styles from "./TestComponent.module.scss";

const COMP = "TestComponent";

const TestComponentMd = createMetadata({
  status: "experimental",
  description: `\`${COMP}\` is a simple test component used in integration tests.`,
  props: {
    label: {
      description: "Text label to display inside the component.",
      valueType: "string",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-100",
    [`textColor-${COMP}`]: "$textColor-primary",
  },
});

function TestComponentRender({ label }: { label?: string }) {
  return <div className={styles.testComponent}>TestComponent: {label}</div>;
}

export const testComponentRenderer = wrapComponent(COMP, TestComponentRender, TestComponentMd);
