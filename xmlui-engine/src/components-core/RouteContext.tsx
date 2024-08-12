import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "@components-core/constants";

type RouteDef = {
  url: string;
  children: ReactNode;
};
type RouteDefOption = RouteDef & { id: string };
export const RouteContext = createContext({
  register: (col: RouteDefOption) => {},
  unRegister: (id: string) => {},
});

export function useRouteContextValue() {
  const [routes, setRoutes] = useState<Array<RouteDefOption>>(EMPTY_ARRAY);
  const routeContextValue = useMemo(() => {
    return {
      register: (column: RouteDefOption) => {
        setRoutes(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
          })
        );
      },
      unRegister: (id: string) => {
        setRoutes(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          })
        );
      },
    };
  }, []);

  return {
    routes,
    routeContextValue,
  };
}

export function useRouteContext() {
  return useContext(RouteContext);
}
