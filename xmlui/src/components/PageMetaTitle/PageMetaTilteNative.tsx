import { Helmet } from "react-helmet-async";

// Default props for PageMetaTitle component
export const defaultProps = {
  title: "XMLUI Application"
};

export const PageMetaTitle = ({ title = defaultProps.title }: { title: string }) => {
  return <Helmet title={title} />;
};
