import type React from "react";
import { type CSSProperties, forwardRef, memo, useEffect, useRef } from "react";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

import styles from "./MediaPlayer.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

type MediaKind = "video" | "audio";
type TimeHandler = (event: { currentTime: number }) => void;

type Props = {
  kind?: MediaKind;
  src?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  crossOrigin?: "anonymous" | "use-credentials";
  playbackRate?: number;
  poster?: string;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
  // Passed by wrapComponent in stateful mode; MediaPlayer has no value
  value?: unknown;
  initialValue?: unknown;
  onPlay?: TimeHandler;
  onPause?: TimeHandler;
  onSeeked?: TimeHandler;
  onEnded?: TimeHandler;
  onTimeUpdate?: TimeHandler;
  onLoadedMetadata?: (event: {
    duration: number;
    videoWidth?: number;
    videoHeight?: number;
  }) => void;
  // Passed by wrapComponent only when verbose tracing is on (captureNativeEvents)
  onNativeEvent?: (event: Record<string, unknown>) => void;
};

// NaN (no metadata yet) reads as undefined; Infinity (live streams) is kept
function knownDuration(el: HTMLMediaElement): number | undefined {
  return Number.isNaN(el.duration) ? undefined : el.duration;
}

// The media's file name, so trace entries from different players are distinguishable
function mediaLabel(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const path = src.split(/[?#]/)[0];
  const name = path.substring(path.lastIndexOf("/") + 1);
  try {
    return decodeURIComponent(name) || undefined;
  } catch {
    return name || undefined;
  }
}

export const MediaPlayer = memo(
  forwardRef(function MediaPlayer(
    {
      kind = "video",
      src,
      controls = true,
      autoPlay = false,
      loop = false,
      muted = false,
      preload,
      crossOrigin,
      playbackRate = 1,
      poster,
      style,
      className,
      classes,
      registerComponentApi,
      updateState,
      value: _value,
      initialValue: _initialValue,
      onPlay,
      onPause,
      onSeeked,
      onEnded,
      onTimeUpdate,
      onLoadedMetadata,
      onNativeEvent,
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLMediaElement>,
  ) {
    const mediaRef = useRef<HTMLMediaElement>(null);
    const composedRef = useComposedRefs(ref, mediaRef);

    // Reactive state: values that change rarely. currentTime is deliberately
    // excluded (it changes on every timeupdate); read it via getCurrentTime().
    useEffect(() => {
      updateState?.({ paused: true, ended: false, duration: undefined });
    }, [updateState, src, kind]);

    useEffect(() => {
      const el = mediaRef.current;
      if (el && Number.isFinite(playbackRate) && playbackRate > 0) {
        // Loading a new source resets playbackRate to defaultPlaybackRate
        el.defaultPlaybackRate = playbackRate;
        el.playbackRate = playbackRate;
      }
    }, [playbackRate, src, kind]);

    // React does not reliably reflect `muted` to the element; set the property
    useEffect(() => {
      if (mediaRef.current) {
        mediaRef.current.muted = muted;
      }
    }, [muted, src, kind]);

    useEffect(() => {
      registerComponentApi?.({
        play: () => mediaRef.current?.play(),
        pause: () => mediaRef.current?.pause(),
        seek: (seconds: number) => {
          const el = mediaRef.current;
          const target = Number(seconds);
          if (el && Number.isFinite(target)) {
            el.currentTime = Math.max(0, target);
          }
        },
        getCurrentTime: () => mediaRef.current?.currentTime ?? 0,
      });
    }, [registerComponentApi]);

    const at = (e: React.SyntheticEvent<HTMLMediaElement>) => ({
      currentTime: e.currentTarget.currentTime,
    });

    // Semantic trace entries (native:media.play, ...). The "media." prefix keeps
    // wrapComponent from also dispatching them to the app's onPlay/... handlers.
    // The position travels in `traceData`, which wrapComponent copies to the entry's
    // top-level `data` so it survives an Inspector export.
    const trace = (name: string, payload: Record<string, unknown>) =>
      onNativeEvent?.({
        type: `media.${name}`,
        displayLabel: mediaLabel(src),
        traceData: { kind, ...payload },
      });

    const mediaProps = {
      ...rest,
      ref: composedRef,
      src,
      controls,
      autoPlay,
      loop,
      muted,
      preload,
      crossOrigin,
      className: classnames(
        classes?.[COMPONENT_PART_KEY],
        className,
        styles.mediaPlayer,
        kind === "audio" ? styles.audio : styles.video,
      ),
      style,
      onPlay: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        updateState?.({ paused: false, ended: false });
        trace("play", at(e));
        onPlay?.(at(e));
      },
      onPause: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        updateState?.({ paused: true });
        trace("pause", at(e));
        onPause?.(at(e));
      },
      onSeeked: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        updateState?.({ ended: e.currentTarget.ended });
        trace("seeked", at(e));
        onSeeked?.(at(e));
      },
      onEnded: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        updateState?.({ ended: true, paused: e.currentTarget.paused });
        trace("ended", at(e));
        onEnded?.(at(e));
      },
      onTimeUpdate: onTimeUpdate
        ? (e: React.SyntheticEvent<HTMLMediaElement>) => onTimeUpdate(at(e))
        : undefined,
      onLoadedMetadata: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        const el = e.currentTarget;
        const duration = knownDuration(el);
        updateState?.({ duration });
        trace("loadedMetadata", { duration });
        if (onLoadedMetadata) {
          onLoadedMetadata(
            kind === "video"
              ? {
                  duration,
                  videoWidth: (el as HTMLVideoElement).videoWidth,
                  videoHeight: (el as HTMLVideoElement).videoHeight,
                }
              : { duration },
          );
        }
      },
      onDurationChange: (e: React.SyntheticEvent<HTMLMediaElement>) => {
        updateState?.({ duration: knownDuration(e.currentTarget) });
      },
      onEmptied: () => {
        updateState?.({ paused: true, ended: false, duration: undefined });
      },
    };

    return kind === "audio" ? (
      <audio {...(mediaProps as React.AudioHTMLAttributes<HTMLAudioElement>)} />
    ) : (
      <video
        {...(mediaProps as React.VideoHTMLAttributes<HTMLVideoElement>)}
        poster={poster}
      />
    );
  }),
);
