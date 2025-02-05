type Props = {
  content?: string;
  style?: React.CSSProperties;
  hostElement?: string;
};

export const RawHtml = ({ content, hostElement, style }: Props) => {
  if (hostElement === "div") {
    return <div style={style} dangerouslySetInnerHTML={{ __html: content }} />;
  } else {
    return <span style={style} dangerouslySetInnerHTML={{ __html: content }} />;
  }
};
