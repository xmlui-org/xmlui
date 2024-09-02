import { useMemo } from "react";

import styles from "@components/Stack/Stack.module.scss";
import { capitalizeFirstLetter } from "@components-core/utils/misc";

// This react hooks prepares CSS style values according to the CSS flex semantics to combine orientation,
// horizontal, and vertical alignments.
export function useContentAlignment(orientation: string, horizontal?: string, vertical?: string) {
  return useMemo(() => {
    // --- Use CSS flex semantics to combine the orientation with alignment to prepare the CSS properties
    return orientation === "horizontal"
      ? {
          horizontal: horizontal && styles[`justifyItems${capitalizeFirstLetter(horizontal)}`],
          vertical: vertical && styles[`alignItems${capitalizeFirstLetter(vertical)}`],
        }
      : {
          horizontal: horizontal && styles[`alignItems${capitalizeFirstLetter(horizontal)}`],
          vertical: vertical && styles[`justifyItems${capitalizeFirstLetter(vertical)}`],
        };
  }, [orientation, horizontal, vertical]);
}
