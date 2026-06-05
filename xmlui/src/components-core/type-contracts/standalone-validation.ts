import type { ComponentDef, CompoundComponentDef } from "../../abstractions/ComponentDefs";
import type { StandaloneAppDescription } from "../abstractions/standalone";
import type { MetadataProvider } from "../../language-server/services/common/metadata-utils";
import { verifyComponentDef } from "./verifier";
import { filterSuppressedTypeContractDiagnostics } from "./suppression";

export enum StandaloneValidationSeverity {
  Skip,
  Warning,
  Error,
  Strict,
}

export type ComponentValidationIssues = {
  issues: {
    message: string;
  }[];
  componentName: string;
};

export function getStandaloneValidationSeverity(
  lintSeverityOption: string | undefined,
): StandaloneValidationSeverity {
  if (!lintSeverityOption) {
    return StandaloneValidationSeverity.Warning;
  }

  switch (lintSeverityOption.toLowerCase()) {
    case "warning":
      return StandaloneValidationSeverity.Warning;
    case "error":
      return StandaloneValidationSeverity.Error;
    case "skip":
      return StandaloneValidationSeverity.Skip;
    case "strict":
      return StandaloneValidationSeverity.Strict;
    default:
      console.warn(
        `Invalid lint severity option '${lintSeverityOption}'. Must be one of: 'warning', 'error', 'skip', 'strict'. Defaulting to 'warning'.`,
      );
      return StandaloneValidationSeverity.Warning;
  }
}

export function validateStandaloneAppTypeContracts({
  appDef,
  metadataProvider,
  strict,
}: {
  appDef: StandaloneAppDescription;
  metadataProvider: MetadataProvider;
  strict: boolean;
}): ComponentValidationIssues[] {
  const registry = metadataProvider.componentMetadataMap();
  const entryPoint = appDef.entryPoint;
  const entryPointDef: ComponentDef | undefined =
    entryPoint && "name" in (entryPoint as CompoundComponentDef) && !("type" in entryPoint)
      ? (entryPoint as CompoundComponentDef).component
      : (entryPoint as ComponentDef | undefined);
  const entryPointDiagnostics = verifyComponentDef(entryPointDef, registry, {
    strict,
    skipUnknown: true,
  });
  const entryPointIssues: ComponentValidationIssues = {
    componentName: "Main",
    issues: filterSuppressedTypeContractDiagnostics(
      entryPointDiagnostics,
      sourceForComponent(appDef, entryPointDef, "Main"),
    ).map(toTypeContractIssue),
  };

  const compoundCompIssues: ComponentValidationIssues[] = (appDef.components ?? []).map((c) => {
    const diagnostics = verifyComponentDef(c.component, registry, {
      strict,
      skipUnknown: true,
    });
    const issues = filterSuppressedTypeContractDiagnostics(
      diagnostics,
      sourceForComponent(appDef, c.component, c.name),
    ).map(toTypeContractIssue);
    return { issues, componentName: c.name };
  });

  return [entryPointIssues, ...compoundCompIssues].filter((diags) => diags.issues.length > 0);
}

export function printComponentValidationIssues(validationIssues: ComponentValidationIssues) {
  console.group(`Validation on '${validationIssues.componentName}':`);

  validationIssues.issues.forEach(({ message }) => {
    console.warn(message);
  });
  console.groupEnd();
}

export function validationErrorsComponent(allIssues: ComponentValidationIssues[]) {
  function makeComponent() {
    const errList = allIssues.map((componentIssues, idx) => {
      return {
        type: "VStack",
        props: { gap: "0px" },
        children: [
          {
            type: "VStack",
            props: { backgroundColor: "lightgrey", padding: "10px" },
            children: [
              {
                type: "H2",
                props: {
                  value: `#${idx + 1}: In component '${componentIssues.componentName}':`,
                  color: "$color-info",
                },
              },
              {
                type: "VStack",
                children: componentIssues.issues.map(({ message }, msgIdx) => {
                  return {
                    type: "Text",
                    props: { value: `${idx + 1}.${msgIdx + 1}: ${message}`, fontWeight: "bold" },
                  };
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

function toTypeContractIssue(
  diag: ReturnType<typeof verifyComponentDef>[number],
): ComponentValidationIssues["issues"][number] {
  return {
    message: `[xmlui:type-contract] [${diag.code}] ${diag.message}${
      diag.suggestion ? ` Did you mean "${diag.suggestion}"?` : ""
    }`,
  };
}

function sourceForComponent(
  appDef: StandaloneAppDescription,
  component: ComponentDef | undefined,
  componentName: string,
): string | undefined {
  const sources = appDef.sources;
  if (!sources) return undefined;

  const fileId = component?.debug?.source?.fileId;
  if (typeof fileId === "string" && sources[fileId] !== undefined) {
    return sources[fileId];
  }

  const expectedNames = componentName === "Main" ? ["Main", "App"] : [componentName];
  for (const [fileName, source] of Object.entries(sources)) {
    const baseName = baseNameWithoutXmluiExtension(fileName);
    if (expectedNames.includes(baseName)) {
      return source;
    }
  }

  return undefined;
}

function baseNameWithoutXmluiExtension(fileName: string): string {
  const normalized = fileName.replace(/\\/g, "/");
  const baseName = normalized.slice(normalized.lastIndexOf("/") + 1);
  return baseName.replace(/\.xmlui$/i, "");
}
