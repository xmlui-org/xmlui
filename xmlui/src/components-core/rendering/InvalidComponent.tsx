import type React from "react";

import styles from "./InvalidComponent.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { EMPTY_ARRAY } from "../constants";

// --- Represents the properties of InvalidComponent
type Props = {
  // -- Errors found while validating component prperties
  errors?: string[];

  // -- The definition of the component validated
  node: ComponentDef;

  // --- Component children to render with the error message
  children?: React.ReactNode;
};

/**
 * This component displays run time errors found while the rendering engine
 * runs. If it finds an issue that hinders regular operation, it renders this
 * component instead of the faulty one.
 */
function InvalidComponent({ errors = EMPTY_ARRAY, node, children }: Props) {
  return (
    <>
      <div className={styles.errorOverlay}>
        <div className={styles.title}>
          <span>
            <b>{node.type}</b> component problems:
          </span>
        </div>
        <ul className={styles.errorItems}>
          {errors.map((error: string, i) => (
            <li className={styles.errorItem} key={i}>
              {error}
            </li>
          ))}
        </ul>
      </div>
      {children}
    </>
  );
}

export default InvalidComponent;
