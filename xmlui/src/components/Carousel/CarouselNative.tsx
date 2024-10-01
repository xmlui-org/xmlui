import * as React from "react";
import classnames from "@components-core/utils/classnames";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { CarouselContext, useCarouselContextValue } from "@components/Carousel/CarouselContext";
import styles from "./Carousel.module.scss";
import { CSSProperties, useCallback, useEffect, useRef } from "react";
import Icon from "@components/Icon/IconNative";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

type CarouselApi = UseEmblaCarouselType[1];

export type CarouselProps = {
  style?: CSSProperties;
  orientation?: "horizontal" | "vertical";
  indicators?: boolean;
  children: React.ReactNode;
  onDisplayDidChange?: (activeSlide: number) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

const CarouselComponent = ({
  orientation = "horizontal",
  children,
  style,
  indicators = true,
  onDisplayDidChange = noop,
  registerComponentApi,
}: CarouselProps) => {
  const ref = useRef(null);
  const { carouselItems, carouselContextValue } = useCarouselContextValue();
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [carouselRef, api] = useEmblaCarousel({
    axis: orientation === "horizontal" ? "x" : "y",
  });

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    const activeIndex = api.selectedScrollSnap();
    onDisplayDidChange(activeIndex);
    setActiveSlide(activeIndex);

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    registerComponentApi?.({
      scrollTo,
      scrollPrev,
      scrollNext,
      canScrollPrev: () => canScrollPrev,
      canScrollNext: () => canScrollNext,
    });
  }, [registerComponentApi, scrollTo, scrollPrev, scrollNext, canScrollPrev, canScrollNext]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider value={carouselContextValue}>
      {children}
      <div
        style={style}
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={classnames(styles.carousel)}
        role="region"
        aria-roledescription="carousel"
      >
        <div ref={carouselRef} className={styles.carouselContentWrapper}>
          <div
            className={classnames(styles.carouselContent, {
              [styles.horizontal]: orientation === "horizontal",
              [styles.vertical]: orientation === "vertical",
            })}
          >
            {carouselItems.map((item, _index) => (
              <div
                key={_index}
                role="group"
                aria-roledescription="slide"
                className={classnames(styles.carouselItem, {
                  [styles.itemHorizontal]: orientation === "horizontal",
                  [styles.itemVertical]: orientation === "vertical",
                })}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.controls}>
          <button
            className={classnames(styles.controlButton, {
              [styles.controlPrevHorizontal]: orientation === "horizontal",
              [styles.controlPrevVertical]: orientation === "vertical",
            })}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <Icon name={"arrowleft"} />
          </button>
          <button
            className={classnames(styles.controlButton, {
              [styles.controlNextHorizontal]: orientation === "horizontal",
              [styles.controlNextVertical]: orientation === "vertical",
            })}
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <Icon name={"arrowright"} />
          </button>
        </div>
        {indicators && (
          <div className={styles.indicators}>
            {carouselItems.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={classnames(styles.indicator, {
                  [styles.active]: index === activeSlide,
                })}
                aria-current={index === activeSlide}
              />
            ))}
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  );
};

export { type CarouselApi, CarouselComponent };
