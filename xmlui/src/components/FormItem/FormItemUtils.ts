import { UNBOUND_FIELD_SUFFIX } from "../Form/formActions";

type ResolveFormItemIdParams = {
  bindTo?: string;
  defaultId: string;
  parentFormItemId?: string | null;
  itemIndex?: number;
};

export function resolveFormItemId({
  bindTo,
  defaultId,
  parentFormItemId,
  itemIndex,
}: ResolveFormItemIdParams): string {
  const safeBindTo = bindTo || `${defaultId}${UNBOUND_FIELD_SUFFIX}`;

  if (parentFormItemId && itemIndex !== undefined) {
    const parentFieldReference = `${parentFormItemId}[${itemIndex}]`;
    if (bindTo !== undefined && bindTo.trim() === "") {
      return parentFieldReference;
    }
    return `${parentFieldReference}.${safeBindTo}`;
  }

  return safeBindTo;
}
