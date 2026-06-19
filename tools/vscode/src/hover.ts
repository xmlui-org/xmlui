import { getXmluiHoverInfo, type XmluiHoverInfo } from "../../../xmlui/src/metadata";

export type XmluiVsCodeHover = XmluiHoverInfo;

export function collectXmluiHover(text: string, offset: number): XmluiVsCodeHover | undefined {
  return getXmluiHoverInfo(text, offset);
}

