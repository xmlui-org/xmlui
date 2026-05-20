import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import collectedComponentMetadata from "../src/language-server/xmlui-metadata-generated.js";

export interface MetadataDriftIssue {
  componentName: string;
  metadataExport: string;
  sourceFile: string;
  missingProps: string[];
}

export interface MetadataDriftResult {
  issues: MetadataDriftIssue[];
  checkedComponents: number;
}

export interface CheckMetadataDriftOptions {
  repoRoot?: string;
  componentsDir?: string;
  metadataRegistry?: Record<
    string,
    {
      props?: Record<string, { isInternal?: boolean } | unknown>;
      isHtmlTag?: boolean;
      allowArbitraryProps?: boolean;
    }
  >;
}

const IGNORED_METADATA_PROPS = new Set(["debug"]);
const IMPLICIT_HANDLED_PROPS = new Set([
  "id",
  "uid",
  "testId",
  "when",
  "inspect",
  "data",
  "style",
  "className",
]);
const VIRTUAL_COMPONENTS = new Set(["DataSource"]);
const FRAMEWORK_HANDLED_PROPS = new Map<string, ReadonlySet<string>>([
  ["Stack", new Set(["dock"])],
  ["HStack", new Set(["dock"])],
  ["VStack", new Set(["dock"])],
  ["CHStack", new Set(["dock"])],
  ["CVStack", new Set(["dock"])],
]);

export function checkMetadataDrift(
  options: CheckMetadataDriftOptions = {},
): MetadataDriftResult {
  const repoRoot = options.repoRoot ?? path.resolve(import.meta.dirname, "..");
  const componentsDir = options.componentsDir ?? path.join(repoRoot, "src/components");
  const metadataRegistry = options.metadataRegistry ?? collectedComponentMetadata;
  const collectionFile = path.join(componentsDir, "collectedComponentMetadata.ts");
  const exportToSource = mapMetadataExportsToSource(collectionFile, componentsDir);
  const componentToExport = mapComponentsToMetadataExports(collectionFile);
  const tsFiles = listTsFiles(componentsDir);
  const program = ts.createProgram(tsFiles, {
    allowJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const sourceByPath = new Map(
    program.getSourceFiles()
      .filter((sf) => !sf.isDeclarationFile)
      .map((sf) => [path.normalize(sf.fileName), sf]),
  );
  const coverageCache = new Map<string, Set<string>>();
  const issues: MetadataDriftIssue[] = [];
  let checkedComponents = 0;

  for (const [componentName, metadata] of Object.entries(metadataRegistry)) {
    if (metadata.isHtmlTag) continue;
    if (metadata.allowArbitraryProps) continue;
    if (VIRTUAL_COMPONENTS.has(componentName)) continue;
    const metadataProps = Object.keys(metadata.props ?? {})
      .filter((p) => {
        const propMeta = metadata.props?.[p] as { isInternal?: boolean } | undefined;
        return !IGNORED_METADATA_PROPS.has(p) && !p.startsWith("_") && propMeta?.isInternal !== true;
      });
    if (metadataProps.length === 0) continue;

    const metadataExport = componentToExport.get(componentName);
    const sourceFile = metadataExport ? exportToSource.get(metadataExport) : undefined;
    if (!metadataExport || !sourceFile) continue;

    checkedComponents++;
    const componentDir = path.dirname(sourceFile);
    let handledProps = coverageCache.get(componentDir);
    if (!handledProps) {
      handledProps = collectHandledProps(componentDir, sourceByPath, checker);
      coverageCache.set(componentDir, handledProps);
    }

    const missingProps = metadataProps.filter(
      (prop) =>
        !handledProps!.has(prop) &&
        !IMPLICIT_HANDLED_PROPS.has(prop) &&
        !FRAMEWORK_HANDLED_PROPS.get(componentName)?.has(prop),
    );
    if (missingProps.length > 0) {
      issues.push({
        componentName,
        metadataExport,
        sourceFile: path.relative(repoRoot, sourceFile),
        missingProps,
      });
    }
  }

  return { issues, checkedComponents };
}

export function formatMetadataDriftReport(result: MetadataDriftResult): string {
  if (result.issues.length === 0) {
    return `Metadata drift check passed (${result.checkedComponents} component metadata exports checked).`;
  }
  const lines = [
    `Metadata drift check failed (${result.issues.length} component(s) with uncovered metadata props):`,
  ];
  for (const issue of result.issues) {
    lines.push(
      `- ${issue.componentName} (${issue.metadataExport}, ${issue.sourceFile}): ${issue.missingProps.join(", ")}`,
    );
  }
  return lines.join("\n");
}

function mapMetadataExportsToSource(
  collectionFile: string,
  componentsDir: string,
): Map<string, string> {
  const source = ts.createSourceFile(
    collectionFile,
    fs.readFileSync(collectionFile, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const out = new Map<string, string>();
  for (const stmt of source.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!stmt.importClause?.namedBindings || !ts.isNamedImports(stmt.importClause.namedBindings)) {
      continue;
    }
    const moduleText = (stmt.moduleSpecifier as ts.StringLiteral).text;
    const resolved = path.normalize(path.resolve(componentsDir, moduleText) + ".tsx");
    for (const spec of stmt.importClause.namedBindings.elements) {
      out.set(spec.name.text, resolved);
    }
  }
  return out;
}

function mapComponentsToMetadataExports(collectionFile: string): Map<string, string> {
  const source = ts.createSourceFile(
    collectionFile,
    fs.readFileSync(collectionFile, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const out = new Map<string, string>();
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "collectedComponentMetadata" &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const key = propertyNameText(prop.name);
        if (!key || !ts.isIdentifier(prop.initializer)) continue;
        out.set(key, prop.initializer.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return out;
}

function collectHandledProps(
  componentDir: string,
  sourceByPath: Map<string, ts.SourceFile>,
  checker: ts.TypeChecker,
): Set<string> {
  const handled = new Set<string>();
  for (const fileName of fs.readdirSync(componentDir)) {
    if (!/\.(tsx|ts)$/.test(fileName)) continue;
    const source = sourceByPath.get(path.normalize(path.join(componentDir, fileName)));
    if (!source) continue;
    collectPropsFromTypes(source, checker, handled);
    collectPropsFromSyntax(source, handled);
  }
  return handled;
}

function collectPropsFromTypes(
  source: ts.SourceFile,
  checker: ts.TypeChecker,
  handled: Set<string>,
) {
  const visit = (node: ts.Node) => {
    const name = (node as any).name;
    if (
      name &&
      ts.isIdentifier(name) &&
      /(^Props$|Props$)/.test(name.text) &&
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
    ) {
      const type = checker.getTypeAtLocation(name);
      for (const prop of checker.getPropertiesOfType(type)) {
        if (!prop.name.startsWith("__")) handled.add(prop.name);
      }
    }
    if (ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        if (ts.isPropertySignature(member)) {
          const key = propertyNameText(member.name);
          if (key) handled.add(key);
        }
      }
    }
    if (ts.isInterfaceDeclaration(node) || ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        if (
          ts.isPropertySignature(member) &&
          propertyNameText(member.name) === "props" &&
          member.type
        ) {
          const propsType = checker.getTypeAtLocation(member.type);
          for (const prop of checker.getPropertiesOfType(propsType)) {
            if (!prop.name.startsWith("__")) handled.add(prop.name);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

function collectPropsFromSyntax(source: ts.SourceFile, handled: Set<string>) {
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAccessExpression(node)) {
      const expr = unwrapExpression(node.expression);
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "props" &&
        isPropCarrier(unwrapExpression(expr.expression))
      ) {
        handled.add(node.name.text);
      }
      if (ts.isIdentifier(expr) && expr.text === "props") {
        handled.add(node.name.text);
      }
    }
    if (ts.isElementAccessExpression(node) && isStringLike(node.argumentExpression)) {
      const expr = unwrapExpression(node.expression);
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "props" &&
        isPropCarrier(unwrapExpression(expr.expression))
      ) {
        handled.add(stringLikeText(node.argumentExpression));
      }
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);
      if (
        ts.isPropertyAccessExpression(initializer) &&
        initializer.name.text === "props" &&
        isPropCarrier(unwrapExpression(initializer.expression))
      ) {
        for (const element of node.name.elements) {
          const key = propertyNameText(element.propertyName ?? element.name as any);
          if (key) handled.add(key);
        }
      }
    }
    if (ts.isCallExpression(node) && isIdentifierNamed(node.expression, "wrapComponent")) {
      const config = node.arguments[3];
      if (config && ts.isObjectLiteralExpression(config)) {
        collectWrapComponentConfigProps(config, handled);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

function collectWrapComponentConfigProps(
  config: ts.ObjectLiteralExpression,
  handled: Set<string>,
) {
  for (const prop of config.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = propertyNameText(prop.name);
    if (!key) continue;
    if (["booleans", "strings", "numbers", "apis", "exclude"].includes(key)) {
      collectStringArray(prop.initializer, handled);
    } else if (["events", "rename", "renderers"].includes(key)) {
      collectObjectKeys(prop.initializer, handled);
    }
  }
}

function collectStringArray(node: ts.Expression, handled: Set<string>) {
  if (!ts.isArrayLiteralExpression(node)) return;
  for (const item of node.elements) {
    if (isStringLike(item)) handled.add(stringLikeText(item));
  }
}

function collectObjectKeys(node: ts.Expression, handled: Set<string>) {
  if (!ts.isObjectLiteralExpression(node)) return;
  for (const prop of node.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const key = propertyNameText(prop.name);
      if (key) handled.add(key);
    }
  }
}

function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function isPropCarrier(node: ts.Expression): boolean {
  return ts.isIdentifier(node) && ["node", "componentNode", "safeNode"].includes(node.text);
}

function isIdentifierNamed(node: ts.Expression, name: string): boolean {
  return ts.isIdentifier(node) && node.text === name;
}

function isStringLike(node: ts.Node): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function stringLikeText(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral): string {
  return node.text;
}

function propertyNameText(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listTsFiles(full));
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkMetadataDrift();
  const report = formatMetadataDriftReport(result);
  if (result.issues.length > 0) {
    console.error(report);
    process.exitCode = 1;
  } else {
    console.log(report);
  }
}
