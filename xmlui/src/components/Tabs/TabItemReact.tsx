import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useEffect, useId } from "react";

import { useTabsContext } from "./TabContext";

export type TabItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  activated?: () => void;
  children?: ReactNode;
  header?: ReactNode;
  id?: string;
  index?: number;
  label?: string;
};

export const TabItemComponent = forwardRef<HTMLDivElement, TabItemProps>(function TabItemComponent(
  {
    activated,
    children,
    header,
    id,
    index = 0,
    label = "",
  },
  _ref,
) {
  const context = useTabsContext();
  const generatedId = useId();
  const innerId = id || generatedId;

  useEffect(() => {
    context?.register({
      activated,
      content: children,
      header,
      id,
      index,
      innerId,
      label,
    });
    return () => context?.unregister(innerId);
  }, [activated, children, context, header, id, index, innerId, label]);

  return null;
});
