export const MediaBreakpointKeys = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

export type MediaBreakpointType = (typeof MediaBreakpointKeys)[number];
