import * as React from "react";
import {ReactNode, useMemo, useState} from "react";
import { EMPTY_ARRAY } from "@components-core/constants";
import produce from "immer";

type CarouselContextProps = {
  register: (carouselItem: {content: ReactNode, id: string}) => void;
  unRegister: (id: string) => void;
};

export const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarouselContextValue() {
  const [carouselItems, setCarouselItems] = useState(EMPTY_ARRAY);
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
    };
  }, [setCarouselItems]);

  return {
    carouselItems,
    carouselContextValue,
  };
}

export function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}
