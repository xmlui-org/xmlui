import { Helmet } from "react-helmet-async";

export const PageMetaTitle = ({ title }: { title: string }) => {
  return <Helmet title={title} />;
};

