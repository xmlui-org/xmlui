import { UNBOUND_FIELD_SUFFIX } from "../../components/Form/formActions";
import type { Behavior } from "./Behavior";

export function hasActiveValidationProp(
  context: Parameters<Behavior["canAttach"]>[0],
  node: Parameters<Behavior["canAttach"]>[1],
) {
  const { extractValue } = context;
  const props = node.props ?? {};

  return extractValue.asOptionalBoolean(props.required) === true;
}

export function createBehaviorUnboundFieldId(uid: unknown) {
  return `${String(uid).replace(/\W/g, "_")}${UNBOUND_FIELD_SUFFIX}`;
}
