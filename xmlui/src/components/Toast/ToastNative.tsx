import { useEffect, useRef } from "react";
import { useEvent } from "../../components-core/utils/misc";
import toast from "react-hot-toast";

export const Toast = ({ renderContent, registerComponentApi }) => {
  const thizRef = useRef({ id: null });
  const show = useEvent((type, context) => {
    thizRef.current.id = (toast[type] || toast)(renderContent(type, context), {
      id: thizRef.current.id,
    });
  });

  useEffect(() => {
    registerComponentApi?.({
      loading: (context) => show("loading", context),
      success: (context) => show("success", context),
      error: (context) => show("error", context),
      show: (context) => show(null, context),
    });
  }, [registerComponentApi, show]);

  return null;
};
