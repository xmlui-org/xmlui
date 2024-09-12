type Props = {};

const positionInGroupValues = ["single", "first", "middle", "last"] as const;
export const positionInGroupNames: string[] = [...positionInGroupValues];

export const Accordion = ({}: Props) => {
  return (
    <div style={{ backgroundColor: "orangered", color: "white", padding: 2 }}>
      Accordion component is not implemented yet
    </div>
  );
};
