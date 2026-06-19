import { getXmluiCompletions, type XmluiCompletionItem } from "../../../xmlui/src/metadata";

export type XmluiVsCodeCompletion = XmluiCompletionItem;

export function collectXmluiCompletions(text: string, offset: number): XmluiVsCodeCompletion[] {
  return getXmluiCompletions(text, offset);
}

