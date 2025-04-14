import { VisuallyHidden as VH } from "@radix-ui/react-visually-hidden";

export const VisuallyHidden = ({ children, ...props }: { children: React.ReactNode }) => (
  <VH {...props}>{children}</VH>
);
