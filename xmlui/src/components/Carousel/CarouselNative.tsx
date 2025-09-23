import * as React from "react";
import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Carousel.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { CarouselContext, useCarouselContextValue } from "./CarouselContext";
import Icon from "../Icon/IconNative";
import type { OrientationOptions } from "../abstractions";

type CarouselApi = UseEmblaCarouselType[1];

export type CarouselProps = {
  style?: CSSProperties;
  className?: string;
  orientation?: OrientationOptions;
  indicators?: boolean;
  controls?: boolean;
  children: React.ReactNode;
  autoplay?: boolean;
  loop?: boolean;
  startIndex?: number;
  prevIcon?: string;
  nextIcon?: string;
  onDisplayDidChange?: (activeSlide: number) => void;
  registerComponentApi?: RegisterComponentApiFn;
  transitionDuration?: number;
  autoplayInterval?: number;
  stopAutoplayOnInteraction?: boolean;
};

export const defaultProps: Pick<
  CarouselProps,
  | "orientation"
  | "indicators"
  | "autoplay"
  | "controls"
  | "loop"
  | "startIndex"
  | "transitionDuration"
  | "autoplayInterval"
  | "stopAutoplayOnInteraction"
> = {
  orientation: "horizontal",
  indicators: true,
  autoplay: false,
  controls: true,
  loop: false,
  startIndex: 0,
  transitionDuration: 25,
  autoplayInterval: 5000,
  stopAutoplayOnInteraction: true,
};

export const CarouselComponent = forwardRef(function CarouselComponent(
  {
    orientation = defaultProps.orientation,
    children,
    style,
    className,
    indicators = defaultProps.indicators,
    onDisplayDidChange = noop,
    autoplay = defaultProps.autoplay,
    controls = defaultProps.controls,
    loop = defaultProps.loop,
    startIndex = defaultProps.startIndex,
    prevIcon,
    nextIcon,
    transitionDuration = defaultProps.transitionDuration,
    autoplayInterval = defaultProps.autoplayInterval,
    stopAutoplayOnInteraction = defaultProps.stopAutoplayOnInteraction,
    registerComponentApi,
    ...rest
  }: CarouselProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const referenceElement = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [plugins, setPlugins] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { carouselContextValue, carouselItems } = useCarouselContextValue(indicators);
  const ref = forwardedRef ? composeRefs(referenceElement, forwardedRef) : referenceElement;

  const [carouselRef, api] = useEmblaCarousel(
    {
      axis: orientation === "horizontal" ? "x" : "y",
      loop,
      startIndex,
      duration: transitionDuration,
    },
    plugins,
  );

  const prevIconName = prevIcon || (orientation === "horizontal" ? "arrowleft" : "arrowup");
  const nextIconName = nextIcon || (orientation === "horizontal" ? "arrowright" : "arrowdown");

  useEffect(() => {
    if (autoplay) {
      setPlugins([
        Autoplay({
          delay: autoplayInterval,
          stopOnInteraction: stopAutoplayOnInteraction,
        }),
      ]);
    }
  }, [autoplayInterval, autoplay, stopAutoplayOnInteraction]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = api?.plugins()?.autoplay;
    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
    playOrStop();
  }, [api]);

  useEffect(() => {
    const autoplay = api?.plugins()?.autoplay;
    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    api
      .on("autoplay:play", () => setIsPlaying(true))
      .on("autoplay:stop", () => setIsPlaying(false))
      .on("reInit", () => setIsPlaying(autoplay.isPlaying()));
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback(
    (api: CarouselApi) => {
      if (!api) {
        return;
      }

      const activeIndex = api.selectedScrollSnap();
      onDisplayDidChange(activeIndex);
      setActiveSlide(activeIndex);

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    },
    [onDisplayDidChange],
  );

  const scrollPrev = useCallback(() => {
    if (api) {
      api?.scrollPrev();
    }
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (orientation === "horizontal") {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      } else {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          scrollNext();
        }
      }
    },
    [orientation, scrollPrev, scrollNext],
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
    api.on("init", onSelect);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (referenceElement?.current) {
      referenceElement.current.addEventListener("keydown", handleKeyDown);
    }
  }, [ref, handleKeyDown]);

  return (
    <CarouselContext.Provider value={carouselContextValue}>
      <div
        {...rest}
        style={style}
        ref={ref}
        className={classnames(styles.carousel, className)}
        role="region"
        tabIndex={-1}
        aria-roledescription="carousel"
      >
        <div ref={carouselRef} className={styles.carouselContentWrapper}>
          <div
            className={classnames(styles.carouselContent, {
              [styles.horizontal]: orientation === "horizontal",
              [styles.vertical]: orientation === "vertical",
            })}
          >
            {children}
          </div>
        </div>
        {controls && (
          <div className={styles.controls}>
            {autoplay && (
              <button
                className={styles.controlButton}
                onClick={toggleAutoplay}
                aria-label={isPlaying ? "Pause Autoplay" : "Start Autoplay"}
              >
                {isPlaying ? <Icon name={"pause"} /> : <Icon name={"play"} />}
              </button>
            )}
            <button
              className={styles.controlButton}
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              aria-label="Previous Slide"
            >
              <Icon name={prevIconName} />
            </button>
            <button
              className={styles.controlButton}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next Slide"
            >
              <Icon name={nextIconName} />
            </button>
          </div>
        )}
        {indicators && (
          <div className={styles.indicators} role="tablist" aria-label="Select slide">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-label={`Go to slide ${index + 1}`}
                aria-controls="carousel"
                tabIndex={index === activeSlide ? 0 : -1}
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
});
