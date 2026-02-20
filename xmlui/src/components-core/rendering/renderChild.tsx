import type { ReactNode } from "react";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { InnerRendererContext } from "../abstractions/ComponentRenderer";
import type { ComponentCleanupFn } from "../rendering/ContainerWrapper";
import { shouldKeep, extractParam } from "../utils/extractParam";
import { ComponentWrapper } from "./ComponentWrapper";
import type { StatePartChangedFn } from "./ContainerWrapper";

/**
 * This type represents the context in which the React component belonging to a
 * particular component definition is rendered with the `renderChild()` function.
 */
export interface ChildRendererContext extends InnerRendererContext {
  statePartChanged: StatePartChangedFn;
  cleanup: ComponentCleanupFn;
  globalVars?: Record<string, any>;
}

/**
 * This function is the jolly-joker of the rendering process. It renders a child component
 * based on the specified context, which contains the component's definition, the current state,
 * and other necessary information.
 *
 * The function checks a few special cases:
 * - <Slot> with a single text node child: it renders the text in the context of the parent component.
 * - CDATA text nodes: it renders the text as is without parsing it.
 * - TextNode: it extracts the text from the node and renders it.
 *
 * In other cases, it extracts the component's ID and renders the component as a <ComponentNode>.
 *
 * As this function passes itself as a renderChild function to the <ComponentNode>, it can render
 * nested components recursively.
 */
export function renderChild({
  node,
  state,
  globalVars,
  dispatch,
  appContext,
  lookupAction,
  lookupSyncCallback,
  registerComponentApi,
  renderChild,
  statePartChanged,
  layoutContext,
  parentRenderContext,
  memoedVarsRef,
  cleanup,
  uidInfoRef,
}: ChildRendererContext): ReactNode {
  // --- Special handling for init event: if component has init event and when=false,
  // --- we still need to let it render once to trigger init, which may change the when condition
  const hasInitEvent = node.events?.init;
  const shouldCheckWhen =
    !hasInitEvent || node.type === "TextNode" || node.type === "TextNodeCData";

  // --- Render only visible components (skip when check if component has init event)
  if (shouldCheckWhen && !shouldKeep(node.when, state, appContext)) {
    return null;
  }

  // --- We do not parse text nodes specified with CDATA to avoid whitespace collapsing
  const nodeValue = (node.props as any)?.value;
  if (node.type === "TextNodeCData") {
    return nodeValue ?? "";
  }

  // --- A TextNode value may contain nexted expressions, so we extract it.
  if (node.type === "TextNode") {
    const extractedValue = extractParam(state, nodeValue, appContext, true);
    return typeof extractedValue === "boolean" ? extractedValue.toString() : extractedValue;
  }

  // --- Rendering a Slot requires some preparations, as TextNode and
  // --- TextNodeCData are virtual nodes. Also, slots may have default templates
  // --- to render when no slot children are specified. The following section
  // --- handles these cases.
  if (node.type === "Slot") {
    // --- Check for special Slot cases
    let slotChildren: ComponentDef | ComponentDef[];
    const templateName = node.props?.name;
    if (templateName) {
      // --- Let's check the validity of the slot name
      if (!templateName.endsWith("Template")) {
        throw new Error(
          `Slot name '${templateName}' is not valid. ` +
            "A named slot should use a name ending with 'Template'.",
        );
      }

      // --- Named slot: use a template property from the parent component
      slotChildren = parentRenderContext?.props?.[templateName];
    } else {
      // --- Children slot: use the children of the parent component
      slotChildren = parentRenderContext?.children;
    }

    if (!slotChildren) {
      // --- No children to render, let's try the default slot template (if there is any)
      slotChildren = node.children;
    }

    if (slotChildren) {
      const toRender = Array.isArray(slotChildren) ? slotChildren : [slotChildren];
      // --- Check for the virtual nodes. At this point, parentRendererContext is
      // --- undefined when the parent does not provide slot children. In this case,
      // --- the ComponentBed component will render the default slot template.
      if (toRender.length === 1 && parentRenderContext) {
        if (toRender[0].type === "TextNodeCData" || toRender[0].type === "TextNode") {
          // --- Preserve the text and render it in the parent context
          return parentRenderContext.renderChild(toRender);
        }
      }
    }
  }

  // --- In other cases, we extract the component ID, and then render the component.
  // --- A component's ID is generally a string with identifier syntax. However, some
  // --- internal components have IDs with expressions, so we evaluate them.
  const key = extractParam(state, node.uid, appContext, true);

  return (
    <ComponentWrapper
      key={key}
      resolvedKey={key}
      node={node}
      cleanup={cleanup}
      statePartChanged={statePartChanged}
      memoedVarsRef={memoedVarsRef}
      state={state}
      globalVars={globalVars}
      dispatch={dispatch}
      appContext={appContext}
      lookupAction={lookupAction}
      lookupSyncCallback={lookupSyncCallback}
      registerComponentApi={registerComponentApi}
      renderChild={renderChild}
      layoutContext={layoutContext}
      parentRenderContext={parentRenderContext}
      uidInfoRef={uidInfoRef}
    />
  );
}
