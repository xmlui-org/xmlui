import { createContext, useContext, useMemo, useState } from "react";
import produce from "immer";

export const CarouselContext = createContext({
  register: (column: any) => {},
  unRegister: (id: string) => {},
  itemProps: {},
});
export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
};

export function useCarouselContextValue(isTabbed: boolean) {
  const [carouselItems, setCarouselItems] = useState([]);

  const carouselContextValue = useMemo(() => {
    return {
      register: (column: any) => {
        setCarouselItems(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
          }),
        );
      },
      unRegister: (id: string) => {
        setCarouselItems(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          }),
        );
      },
      itemProps: isTabbed
        ? {
            role: "group tabpanel",
          }
        : {
            role: "group",
            "aria-roledescription": "slide",
          },
    };
  }, [setCarouselItems, isTabbed]);

  return {
    carouselItems,
    carouselContextValue,
  };
}
