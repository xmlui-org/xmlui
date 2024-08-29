/**
 * --- Metadata Generator Script ---
 * 
 * NOTE: Typedoc uses TSDoc and JSDoc under the hood to process tags.
 * NOTE #2: TypeDoc generates a bunch of warnings indicating bad links in processed tsx files.
 * Ignore these as the links are correct on the docs site.
 * 
 * All TSDoc tags and most JSdoc tags are supported.
 *
 * We are using custom tags that need to be registered in "tsdoc.json" located on the same level as the tsconfig.json file.
 *
 * On metadata extraction and docs generation:
 * - The script can regenerate specific component docs if the component names are provided as parameters
 * e.g.: npm run get-metadata --entry Card
 * - All properties, events, etc in the component metadata will be exported unless excluded using the @internal tag
 * - A component metadata will be properly processed if the ComponentDef interface in the component file
 * is commented using the JSDoc syntax: \/** something *\/
 * - The component names and thus external doc names are inferred from the component metadata definition,
 * so IT IS IMPORTANT HOW YOU NAME THE COMPONENT DEFINITION, e.g. MarginlessCardComponentDef -> MarginlessCard
 * - We are currently using custom tags to handle descriptions coming from external mdx files (see @descriptionRef tag)
 * - If no external mdx files are provided for a component, set the `descriptionRef` tag to `none`, i.e. @descriptionRef none
 * - When using special characters in the inline description (`, *, >, etc.) that are markdown-compliant,
 * use backticks (`\`) to escape them
 * - Components that are specialized children of a more generic parent component (like H1 of Heading), the specialized form
 * must be indicated using the @specialized tag: @specialized H1. If no explicit parameter is provided, the tag will use the filename
 * to indicate the specialization
 */

const TypeDoc = require("typedoc");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const ACCEPTABLE_PARAMS = ["--entry"];

main().catch(console.error);

// ------------------------------------------------------------------------

async function main() {
  const params = handleInputParams(process.argv);
  const parsedConfig = handleConfig(config);
  const mergedConfig = mergeParamsAndConfig(params, parsedConfig);

  const { workingFolder, sourceFolder, outFolder, entryPoints } = mergedConfig;

  const app = await TypeDoc.Application.bootstrap({
    // Get the component names from reading the relevant component folders
    // TypeDoc will detect the root of the project by looking for a tsconfig.json and checking its contents (& defaults)
    entryPoints,
    logLevel: "Info",
    // This ensures we don't export properties or components tagged with @internal
    excludeInternal: true,
  });
  if (app.entryPoints.length === 0) {
    console.error("Please provide at least one file entrypoint");
    process.exit(1);
  }

  const project = await app.convert();

  if (project) {
    const tree = await getRawTreeFromFile(app, project, workingFolder);
    if (!tree) return;

    // The generated tree looks different if there are more than one files specified as an entry
    if (app.entryPoints.length > 1) {
      let metadata = [];
      for (const componentTree of tree?.children) {
        metadata.push(...processTree(componentTree));
      }
      metadata = metadata.toSorted((a, b) => a.displayName.localeCompare(b.displayName));
      metadataToJson(metadata, outFolder);
    } else {
      const metadata = processTree(tree);
      metadataToJson(metadata, outFolder);
    }
  }

  // ---

  function processTree(tree) {
    const metadata = [];
    const filteredTree = {
      ...tree,
      children: tree?.children?.filter((child) => child.name.endsWith("ComponentDef")),
    };

    for (const componentDefSubTree of filteredTree.children) {
      // The displayName is also used as the default folder name and the default description reference file name
      const displayName = getDisplayName(componentDefSubTree);
      const genericParentInfo = getSpecializedInfo(componentDefSubTree);

      const componentDefMetadata = genericParentInfo
        ? getSpecializedComponent(genericParentInfo, displayName)
        : getRegularComponent(componentDefSubTree, displayName);
      componentDefMetadata.displayName = displayName;

      const sectionVisitor = new SectionFilteringVisitor();
      traverseComponentDefDirectChildren(componentDefSubTree, sectionVisitor);

      for (const sectionSubTree of sectionVisitor.data.foundSections) {
        const attributeVisitor = new AttributeGathererVisitor({
          componentFolder: componentDefMetadata.componentFolder,
          descriptionRef: componentDefMetadata.descriptionRef,
        });
        traverseAttribute(sectionSubTree, attributeVisitor);
        componentDefMetadata[sectionSubTree.name] = attributeVisitor.data.attributes;
      }

      metadata.push(componentDefMetadata);
    }
    return metadata;
  }

  function getSpecializedComponent(genericParent, displayName) {
    return {
      descriptionRef: `./${genericParent}/${displayName}.mdx`,
      componentFolder: `${genericParent}`,
      specializedFrom: genericParent,
    };
  }

  function getRegularComponent(tree, displayName) {
    const description = getDescription(tree);
    // This tag indicates WHERE to look for external mdx files for this particular component, defaults to `sourceFolder`
    const componentFolder = getComponentFolder(tree) ?? displayName;
    // We are only interested in the first param after the tag itself, that is the reason for accessing [0]?.text (it may be empty)
    const descriptionRefFileFallback = `${displayName}.mdx`;
    const descriptionRefFileName = getDescriptionRef(tree);
    // If the keyword 'none' is set for the descriptionRef, there are no external mdx files
    const descriptionRef = descriptionRefFileName === "none" ? "" : `./${componentFolder}/${descriptionRefFileName ?? descriptionRefFileFallback}`;

    return { description, descriptionRef, componentFolder };
  }

  function getDisplayName(tree) {
    return tree.name.substring(0, tree.name.indexOf("ComponentDef"));
  }

  function getSpecializedInfo(tree) {
    const tag = tree.comment?.blockTags?.find((tag) => tag.tag === "@specialized");
    if (!tag) {
      return null;      
    }
    
    const specializedFrom = tag?.content[0]?.text;
    if (specializedFrom) {
      return specializedFrom;
    }
    
    const sourceFilePath = tree.sources[0]?.fileName;
    return path.basename(sourceFilePath, path.extname(sourceFilePath));
  }

  function getDescription(tree) {
    return tree.comment?.summary?.map((s) => s.text).join("\n");
  }

  function getComponentFolder(tree) {
    return tree.comment?.blockTags?.find((tag) => tag.tag === "@componentFolder")?.content?.[0]?.text;
  }

  function getDescriptionRef(tree) {
    return tree.comment?.blockTags?.find((tag) => tag.tag === "@descriptionRef")?.content?.[0]?.text;
  }
}

class Visitor {
  params = {};
  data = {};
  constructor(params) {
    this.params = params;
  }
  visit(node) {}
}

class SectionFilteringVisitor extends Visitor {
  sections = ["props", "events", "api", "contextVars"];
  foundSectionsNum = 0;
  data = {
    foundSections: [],
  };

  visit(node) {
    super.visit(node);
    if (node.variant === "declaration" && this.sections.includes(node?.name)) {
      this.data.foundSections.push(node);
      this.foundSectionsNum++;
      if (this.foundSectionsNum === this.sections.length) {
        return true;
      }
    }
  }
}

class AttributeGathererVisitor extends Visitor {
  params = {};
  data = {
    attributes: {},
  };

  constructor(params) {
    super(params);
    this.params = params;
  }

  visit(node) {
    super.visit(node);
    if (node.variant === "declaration" && node?.name === "__type" && !!node?.children) {
      for (const child of node.children) {
        if (child?.name)
          this.data.attributes[child.name] = {
            description: "",
            descriptionRef: this.params?.descriptionRef ? `${this.params?.descriptionRef}?${child.name}` : "",
            defaultValue: "",
          };
        if (child?.comment) {
          if (child?.comment?.summary) {
            this.data.attributes[child.name].description += child.comment.summary.map((s) => s.text).join("\n");
          }
          if (child?.comment?.blockTags) {
            for (const tag of child.comment.blockTags) {
              if (tag.tag === "@defaultValue") {
                this.data.attributes[child.name].defaultValue += tag.content[0].text.split("\n")[1];
              }
              if (tag.tag === "@descriptionRef" && tag.content[0]?.text) {
                this.data.attributes[child.name].descriptionRef = `./${this.params?.componentFolder ?? ""}/${
                  tag.content[0].text
                }`;
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Performs a depth-first search that traverses a given tree and calls an optional visitor object function
 * on each of the tree nodes. This is a recursive function.
 *
 * The optional visitor can return true to break the traversal.
 *
 * node: {
 *    name: the name of the folder/file (eg. "hello-app-engine")
 *    path: the path to the root of the given folder from the project root (eg. "src/apps/1_basic/samples/hello-app-engine")
 *    parent: parent node
 *    children: children file/folder names
 * }
 */
function traverse(node, visitor) {
  if (typeof visitor === "object" && visitor instanceof Visitor) {
    const breakSign = visitor.visit(node);
    if (breakSign) return;
  }

  if (!node.hasOwnProperty("children")) return;
  if (!node?.children?.length) return;
  for (const child of node.children) {
    traverse(child, visitor);
  }
}

function traverseAttribute(node, visitor) {
  if (typeof visitor === "object" && visitor instanceof Visitor) {
    const breakSign = visitor.visit(node);
    if (breakSign) return;
  }

  for (const entry of Object.entries(node)) {
    const [_, value] = entry;

    if (typeof value === "object" && value !== null) {
      traverseAttribute(value, visitor);
    }
  }
}

function traverseWidthFirst(node, visitor) {
  if (!node.hasOwnProperty("children")) return;
  if (!node?.children?.length) return;

  for (const child of node.children) {
    if (typeof visitor === "object" && visitor instanceof Visitor) {
      const breakSign = visitor.visit(child);
      if (breakSign) return;
    }
  }
  for (const child of node.children) {
    traverseWidthFirst(child, visitor);
  }
}

// NOTE: This is too specialized for traversing starting from a ComponentDef subtree
function traverseComponentDefDirectChildren(node, visitor) {
  const isInterface = isInterfaceDef(node);
  const isType = isTypeDef(node);

  if (!isInterface === !isType) return;

  if (isInterface) {
    if (!node.children?.length) return;
    _traverse(node.children);
  }
  if (isType) {
    if (node.type.type === "intersection" && node.type?.types.length !== 0) {
      node.type.types.filter((t) => isObjectTypeReflection(t)).forEach((t) => _traverse(t?.declaration?.children));
    } else if (isObjectTypeReflection(node.type)) {
      _traverse(node.type?.declaration?.children);
    }
    // There is also "reference", but we are not concerned with that as of yet
  }

  // ---

  function _traverse(children) {
    for (const child of children) {
      if (typeof visitor === "object" && visitor instanceof Visitor) {
        const breakSign = visitor.visit(child);
        if (breakSign) return;
      }
    }
  }

  function isObjectTypeReflection(nodeType) {
    return (
      nodeType?.type === "reflection" && nodeType?.declaration !== null && nodeType?.declaration?.children?.length !== 0
    );
  }
}

async function getRawTreeFromFile(app, data, workingFolder) {
  const tempFileName = "parsed.json";
  try {
    // generateJson works with the relative path
    await app.generateJson(data, path.join("scripts", tempFileName));

    const absoluteFilePath = path.join(workingFolder, tempFileName);
    fs.accessSync(absoluteFilePath, fs.constants.F_OK);
    return JSON.parse(fs.readFileSync(absoluteFilePath));
  } catch (e) {
    console.error("Error was thrown during json generating and reading: " + e?.message || "unknown error");
    return undefined;
  }
}

/* async function getRawTree(app, data, workingFolder) {
  return app.convert();
} */

function metadataToJson(data, outFolder) {
  const fileName = "component-metadata.json";
  try {
    const absolutePath = path.join(outFolder, fileName);
    fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Could not write ${fileName} file: ${e?.message || "unknown error"}`);
  }
}

function handleConfig(config) {
  const workingFolder = path.resolve(__dirname);
  let { sourceFolderPath, outFolderPath, entryPoints } = config;

  const _sourceFolder = path.resolve(workingFolder, sourceFolderPath);
  if (!fs.existsSync(_sourceFolder)) {
    throw new Error(`Source folder ${_sourceFolder} does not exist.`);
  }

  const _outFolder = !outFolderPath ? workingFolder : path.resolve(workingFolder, outFolderPath);
  if (!fs.existsSync(_outFolder)) {
    throw new Error(`Output folder ${_outFolder} does not exist.`);
  }

  return {
    workingFolder,
    sourceFolder: _sourceFolder,
    outFolder: _outFolder,
    entryPoints: [...new Set(entryPoints)] || [],
  };
}

function handleInputParams(argv) {
  const params = {};
  for (let i = 2; i < argv.length; i++) {
    const [key, value] = argv[i].split("=");
    if (key && value && ACCEPTABLE_PARAMS.includes(key)) {
      params[key.substring(2)] = value;
    } else {
      console.error(`Ignoring unknown parameter: ${argv[i]}`);
    }
  }
  return params;
}

function mergeParamsAndConfig(params, config) {
  const mergedConfig = config;

  let presentEntryPoint = undefined;
  for (const entryPoint of config.entryPoints) {
    const absoluteEntryPoint = path.resolve(entryPoint);
    const entryPointFileName = path.basename(absoluteEntryPoint, path.extname(absoluteEntryPoint));
    if (entryPointFileName === params?.entry) {
      presentEntryPoint = entryPoint;
      break;
    }
  }

  if (presentEntryPoint) {
    mergedConfig.entryPoints = [presentEntryPoint];
  }
  if (!presentEntryPoint && params?.entry) {
    console.error(
      `Entry point ${params?.entry} does not exist in the source folder. Using entry points defined in configuration file.`
    );
  }

  return mergedConfig;
}

function isInterfaceDef(node) {
  return node?.variant === "declaration" && node.hasOwnProperty("children") && Array.isArray(node.children);
}

function isTypeDef(node) {
  return (
    node?.variant === "declaration" &&
    node.hasOwnProperty("type") &&
    typeof node.type === "object" &&
    node.type !== null
  );
}
