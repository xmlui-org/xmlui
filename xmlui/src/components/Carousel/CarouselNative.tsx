import * as React from "react";
import classnames from "@components-core/utils/classnames";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { CarouselContext, useCarouselContextValue } from "@components/Carousel/CarouselContext";
import styles from "./Carousel.module.scss";
import { CSSProperties, useRef } from "react";
import Icon from "@components/Icon/IconNative";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

export type CarouselProps = {
  style?: CSSProperties;
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

const CarouselComponent = ({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  style,
}: any) => {
  const ref = useRef(null);
  const { carouselItems, carouselContextValue } = useCarouselContextValue();
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const carouselOrientation = orientation || (opts?.axis === "y" ? "vertical" : "horizontal");

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

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

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

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
        className={classnames(styles.carousel, className)}
        role="region"
        aria-roledescription="carousel"
      >
        <button
          className={classnames(
            styles.controlButton,
            {
              [styles.controlPrevHorizontal]: carouselOrientation === "horizontal",
              [styles.controlPrevVertical]: carouselOrientation === "vertical",
            },
            className,
          )}
          disabled={!canScrollPrev}
          onClick={scrollPrev}
        >
          <Icon name={"arrowleft"} />
        </button>
        <div ref={carouselRef} className={styles.carouselContentWrapper}>
          <div
            className={classnames(
              styles.carouselContent,
              {
                [styles.horizontal]: carouselOrientation === "horizontal",
                [styles.vertical]: carouselOrientation === "vertical",
              },
              className,
            )}
          >
            {carouselItems.map((item, _index) => (
              <div
                key={_index}
                role="group"
                aria-roledescription="slide"
                className={classnames(
                  styles.carouselItem,
                  {
                    [styles.itemHorizontal]: carouselOrientation === "horizontal",
                    [styles.itemVertical]: carouselOrientation === "vertical",
                  },
                  className,
                )}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
        <button
          className={classnames(
            styles.controlButton,
            {
              [styles.controlNextHorizontal]: carouselOrientation === "horizontal",
              [styles.controlNextVertical]: carouselOrientation === "vertical",
            },
            className,
          )}
          onClick={scrollNext}
          disabled={!canScrollNext}
        >
          <Icon name={"arrowright"} />
        </button>
      </div>
    </CarouselContext.Provider>
  );
};

export { type CarouselApi, CarouselComponent };
