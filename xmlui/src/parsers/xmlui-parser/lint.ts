import type { ComponentDef, CompoundComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import type { StandaloneAppDescription } from "../../components-core/abstractions/standalone";
import { layoutOptionKeys } from "../../components-core/descriptorHelper";
import { viewportSizeMd } from "../../components/abstractions";
import { CORE_NAMESPACE_VALUE } from "./transform";

export enum LintSeverity{
  Skip,
  Warning,
  Error
};

export enum LintDiagKind{
  UnrecognisedProp
};

type Options = {
  severity : LintSeverity
}

type LintDiagnostic = {
  message: string,
  kind: LintDiagKind
}

export function getLintSeverity(lintSeverityOption: string | undefined): LintSeverity{
  if (!lintSeverityOption){
    return LintSeverity.Warning;
  }

  let lintSeverity = LintSeverity.Warning;
  switch (lintSeverityOption.toLowerCase()) {
    case "warning":
      return LintSeverity.Warning;
      break;
    case "error":
      return LintSeverity.Error;
      break;
    case "skip":
      return LintSeverity.Skip;
      break;
    default:
      console.warn(`Invalid lint severity option '${lintSeverityOption}'. Must be one of: 'warning', 'error', 'skip'. Defaulting to 'warning'.`);
      return LintSeverity.Warning
      break;
  }
}

export type ComponentLints = {
  lints: {
    message: string,
    kind: LintDiagKind
  }[] ,
  componentName: string;
}

export function lintApp({
  appDef,
  metadataByComponent,
}: {
  appDef: StandaloneAppDescription,
  metadataByComponent: Record<string, ComponentMetadata>
}): ComponentLints[] {

  const entryPointLints: ComponentLints = {
    componentName: "Main",
    lints:  lint({
      component: appDef.entryPoint,
      metadataByComponent: metadataByComponent,
    })
  };

  const compoundCompLints: ComponentLints[] = (appDef.components ?? [])
    .map((c) => {
      const lints = lint({
        component: c,
        metadataByComponent: metadataByComponent,
      });
      return { lints, componentName: c.name };
    })


  return [entryPointLints, ...compoundCompLints].filter((diags) => diags.lints.length > 0);
}

export function printComponentLints(lintDiags: ComponentLints) {
  console.group(`Validation on '${lintDiags.componentName}':`);

  lintDiags.lints.forEach(({message}) => {
    console.warn(message);
  })
  console.groupEnd()
}

export function lintErrorsComponent(lints: ComponentLints[]){
  function makeComponent() {
      const errList = lints
        .map((lint, idx) => {
          return {
            type: "VStack",
            props: { gap: "0px" },
            children: [
              {
                type: "VStack",
                props: { "backgroundColor": 'lightgrey', padding: "10px" },
                children: [
                  {
                    type: "H2",
                    props: {
                      value: `#${idx + 1}: In component '${lint.componentName}':`,
                      color: "$color-info",
                    },
                  },
                  {
                    type: "VStack",
                    children: lint.lints.map(({message}, msgIdx) =>{
                      return {
                        type: "Text",
                        props: { value: `${idx + 1}.${msgIdx + 1}: ${message}`, fontWeight: "bold" },
                      }
                    }),
                  },
                ],
              },
            ],
          };
        });
      const comp: ComponentDef = {
        type: "VStack",
        props: { padding: "$padding-normal", gap: 0 },
        children: [
          {
            type: "H1",
            props: {
              value: `Errors found while checking Xmlui markup`,
              padding: "$padding-normal",
              backgroundColor: "$color-error",
              color: "white",
            },
          },
          {
            type: "VStack",
            props: {
              gap: "$gap-tight",
              padding: "$padding-normal",
            },
            children: errList,
          },
        ],
      };
      return comp;
    }
    return makeComponent() as ComponentDef;
}

export function lint({
  component,
  metadataByComponent,
}: {
  component: CompoundComponentDef | ComponentDef,
  metadataByComponent: Record<string, ComponentMetadata>
}
 ): LintDiagnostic[] {
  if ("component" in component){
      return lintHelp(component.component, metadataByComponent, [])
  }
  return lintHelp(component, metadataByComponent, []);
}

function lintHelp(component: ComponentDef, metadataByComponent: Record<string, ComponentMetadata>, acc: LintDiagnostic[] ){

  const componentType = component.type.startsWith(CORE_NAMESPACE_VALUE) ? component.type.slice(CORE_NAMESPACE_VALUE.length + 1) : component.type
  const metadataForCurrentComponent = metadataByComponent[componentType];

  const skipPropLints = !component.props || !metadataForCurrentComponent || !metadataForCurrentComponent.props || metadataForCurrentComponent.allowArbitraryProps
  if(!skipPropLints){
    lintProps(component, metadataForCurrentComponent, acc);
  }

  if (!component.children){
    return acc;
  }

  for(const child of component.children){
    lintHelp(child, metadataByComponent, acc)
  }
  return acc

}

const implicitPropNames = layoutOptionKeys
function lintProps(component: ComponentDef, metadataForCurrentComponent: ComponentMetadata, diags: LintDiagnostic[]){
  const propNames = Object.keys(component.props);
  const unrecognisedProps = propNames.filter((name) => !implicitProp(name) && !(name in metadataForCurrentComponent.props))

  for(const prop of unrecognisedProps){
    diags.push(toUnrecognisedPropDiag(component, prop))
  }
}

function toUnrecognisedPropDiag(component: ComponentDef, prop: string): LintDiagnostic{
  return {
    message: `Unrecognised property '${prop}' on component '${component.type}'.`,
    kind: LintDiagKind.UnrecognisedProp,
  }
}

function implicitProp(name: string): boolean {
  for(const size of viewportSizeMd){
    const suffix = "-" + ((size as {
              value: string | number;
              description: string;
            }).value);

    if(name.endsWith(suffix)){
      const nameWithoutSize = name.slice(0, -suffix.length);
      if(implicitPropNames.includes(nameWithoutSize)){
        return true
      }
    }
  }
  return implicitPropNames.includes(name);
}
