import { memo } from "react";
import type { ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";

// --- WIP

type Props = {
  children: ReactNode;
  partId?: string;
};

export const Part = memo(function Part({ children, partId }: Props) {
  return <Slot data-part-id={partId}>{children}</Slot>;
});
