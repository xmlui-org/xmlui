export const GrayedOutText = ({ children }: { children: string }) => {
  return <p style={{ color: "gray", fontStyle: "italic", marginTop: 0 }}>{children}</p>;
};
