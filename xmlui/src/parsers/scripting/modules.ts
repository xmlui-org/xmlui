import type {
  ScriptParsingErrorCodes,
  ScriptParserErrorMessage,
} from "../../abstractions/scripting/ScriptParserError";
import type {
  ArrayDestructure,
  ConstStatement,
  FunctionDeclaration,
  LetStatement,
  ModuleErrors,
  ObjectDestructure,
  ScriptModule,
  Statement,
  VarDeclaration,
} from "../../abstractions/scripting/ScriptingSourceTree";
import { TokenType } from "../../abstractions/scripting/Token";
import { ModuleResolver } from "../../abstractions/scripting/modules";
import { LogicalThread } from "../../abstractions/scripting/LogicalThread";
import { BlockScope } from "../../abstractions/scripting/BlockScope";
import type { VisitorState } from "./tree-visitor";
import { visitNode } from "./tree-visitor";
import { errorMessages } from "./ParserError";
import { Parser } from "./Parser";

/**
 * Checks if the result is a module error
 * @param result Result to check
 * @returns True if the result is a module error
 */
export function isModuleErrors(result: ScriptModule | ModuleErrors): result is ModuleErrors {
  return (result as any).type !== "ScriptModule";
}

/**
 * Parses a script module
 * @param moduleName Name of the module
 * @param source Source code to parse
 * @param moduleResolver A function that resolves a module path to the text of the module
 * @returns The parsed and resolved module
 */
export function parseScriptModule(
  moduleName: string,
  source: string,
  moduleResolver: ModuleResolver,
  restrictiveMode = false,
): ScriptModule | ModuleErrors {
  // --- Keep track of parsed modules to avoid circular references
  const parsedModules = new Map<string, ScriptModule>();
  const moduleErrors: ModuleErrors = {};

  const parsedModule = doParseModule(moduleName, source, moduleResolver, true);
  return !parsedModule || Object.keys(moduleErrors).length > 0 ? moduleErrors : parsedModule;

  // --- Do the parsing, allow recursion
  function doParseModule(
    moduleName: string,
    source: string,
    moduleResolver: ModuleResolver,
    topLevel = false,
  ): ScriptModule | null | undefined {
    // --- Do not parse the same module twice
    if (parsedModules.has(moduleName)) {
      return parsedModules.get(moduleName);
    }

    // --- Parse the source code
    const parser = new Parser(source);
    let statements: Statement[] = [];
    try {
      statements = parser.parseStatements()!;
    } catch (error) {
      moduleErrors[moduleName] = parser.errors;
      return null;
    }

    // --- Check for unparsed tail
    const lastToken = parser.current;
    if (lastToken.type !== TokenType.Eof) {
      moduleErrors[moduleName] ??= [];
      moduleErrors[moduleName].push({
        code: "W002",
        text: errorMessages["W002"].replace(/\{(\d+)}/g, () => lastToken.text),
        position: lastToken.location.startLine,
        line: lastToken.location.startLine,
        column: lastToken.location.startColumn,
      });
      return null;
    }

    const errors: ScriptParserErrorMessage[] = [];

    // --- Visit all statements in the module
    const emptyState: VisitorState = {
      data: null,
      cancel: false,
      skipChildren: false,
    };
    visitNode(statements, emptyState, (before, stmt, state, parent, tag?: string) => {
      if (!before) return state;
      if (topLevel) {
        // --- Restrict top-level statements
        switch (stmt.type) {
          case "VarS":
            // --- Allow on top-level var declarations in a top-level module
            if (parent) {
              addErrorMessage("W027", stmt);
            }
            break;
          case "FuncD":
          case "ImportD":
            break;
          default:
            if (restrictiveMode && !parent) {
              addErrorMessage("W028", stmt, stmt.type);
            }
            break;
        }
      } else {
        switch (stmt.type) {
          case "VarS":
            addErrorMessage("W027", stmt);
            break;
          case "FuncD":
            if (restrictiveMode && !stmt.isExported) {
              addErrorMessage("W029", stmt);
            }
            break;
          case "ImportD":
            break;
          default:
            if (restrictiveMode && !parent) {
              addErrorMessage("W028", stmt, stmt.type);
            }
            break;
        }
      }

      return state;
    });

    // --- Hoist functions
    const functions: Record<string, FunctionDeclaration> = {};
    statements
      .filter((stmt) => stmt.type === "FuncD")
      .forEach((stmt) => {
        const func = stmt as FunctionDeclaration;
        if (functions[func.name]) {
          addErrorMessage("W020", stmt, func.name);
          return;
        }
        functions[func.name] = func;
      });

    // --- Collect exports
    const exports = new Map<string, any>();
    statements.forEach((stmt) => {
      if (stmt.type === "ConstS" && stmt.isExported) {
        visitLetConstDeclarations(stmt, (id) => {
          if (exports.has(id)) {
            addErrorMessage("W021", stmt, id);
          } else {
            exports.set(id, stmt);
          }
        });
      } else if (stmt.type === "FuncD" && stmt.isExported) {
        if (exports.has(stmt.name)) {
          addErrorMessage("W021", stmt, stmt.name);
        } else {
          exports.set(stmt.name, stmt);
        }
      }
    });

    // --- Successful module parsing
    const parsedModule: ScriptModule = {
      type: "ScriptModule",
      name: moduleName,
      exports,
      importedModules: [],
      imports: {},
      functions,
      statements,
      executed: false,
    };

    // --- Sign this module as parsed
    parsedModules.set(moduleName, parsedModule);

    // --- Load imported modules and resolve imports
    const importedModules: ScriptModule[] = [];
    const imports: Record<string, Record<string, any>> = {};
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.type !== "ImportD") {
        continue;
      }

      // --- Find the imported module
      const source = moduleResolver(moduleName, stmt.moduleFile);
      if (source === null) {
        addErrorMessage("W022", stmt, stmt.moduleFile);
        continue;
      }

      // --- Parse the imported module
      const imported = doParseModule(stmt.moduleFile, source, moduleResolver);

      if (!imported) {
        // --- Error in the imported module
        return;
      }

      // --- Successful import
      importedModules.push(imported);

      // --- Extract imported names
      const importedItems = Object.keys(stmt.imports);
      if (importedItems.length > 0) {
        imports[stmt.moduleFile] ??= {};
      }
      for (const key of importedItems) {
        if (imported.exports.has(stmt.imports[key])) {
          imports[stmt.moduleFile][key] = imported.exports.get(stmt.imports[key]);
        } else {
          addErrorMessage("W023", stmt, stmt.moduleFile, key);
        }
      }
    }

    // --- Catch errors
    if (errors.length > 0) {
      moduleErrors[moduleName] = errors;
      return null;
    }

    // --- All imported modules use this module as a parent
    importedModules.forEach((m) => (m.parent = parsedModule));

    // --- Done.
    parsedModule.importedModules = importedModules;
    parsedModule.imports = imports;
    return parsedModule;

    function addErrorMessage(code: ScriptParsingErrorCodes, stmt: Statement, ...args: any[]): void {
      let errorText = errorMessages[code];
      if (args) {
        args.forEach(
          (o, idx) => (errorText = errorText.replaceAll(`{${idx}}`, args[idx].toString())),
        );
      }
      errors.push({
        code,
        text: errorMessages[code].replace(/\{(\d+)}/g, (_, index) => args[index]),
        position: stmt.startPosition,
        line: stmt.startLine,
        column: stmt.startColumn,
      });
    }
  }
}

export function obtainClosures(thread: LogicalThread): BlockScope[] {
  const closures = thread.blocks?.slice(0) ?? [];
  return thread.parent ? [...obtainClosures(thread.parent), ...closures] : closures;
}

/**
 * Funtion to process a visited ID
 */
type IdDeclarationVisitor = (id: string) => void;

/**
 * Visits all declarations in a let or const statement
 * @param declaration Declaration to process
 * @param visitor Function to call on each visited declaration
 */
export function visitLetConstDeclarations(
  declaration: LetStatement | ConstStatement,
  visitor: IdDeclarationVisitor,
): void {
  for (let i = 0; i < declaration.declarations.length; i++) {
    let value: any;
    const decl = declaration.declarations[i];
    visitDeclaration(decl, visitor);
  }

  function visitDeclaration(varDecl: VarDeclaration, visitor: IdDeclarationVisitor): void {
    // --- Process each declaration
    if (varDecl.id) {
      visitor(varDecl.id);
    } else if (varDecl.arrayDestruct) {
      visitArrayDestruct(varDecl.arrayDestruct, visitor);
    } else if (varDecl.objectDestruct) {
      visitObjectDestruct(varDecl.objectDestruct, visitor);
    } else {
      throw new Error("Unknown declaration specifier");
    }
  }

  // --- Visits an array destructure declaration
  function visitArrayDestruct(arrayD: ArrayDestructure[], visitor: IdDeclarationVisitor): void {
    for (let i = 0; i < arrayD.length; i++) {
      const arrDecl = arrayD[i];
      if (arrDecl.id) {
        visitor(arrDecl.id);
      } else if (arrDecl.arrayDestruct) {
        visitArrayDestruct(arrDecl.arrayDestruct, visitor);
      } else if (arrDecl.objectDestruct) {
        visitObjectDestruct(arrDecl.objectDestruct, visitor);
      }
    }
  }

  // --- Visits an object destructure declaration
  function visitObjectDestruct(objectD: ObjectDestructure[], visitor: IdDeclarationVisitor): void {
    for (let i = 0; i < objectD.length; i++) {
      const objDecl = objectD[i];
      if (objDecl.arrayDestruct) {
        visitArrayDestruct(objDecl.arrayDestruct, visitor);
      } else if (objDecl.objectDestruct) {
        visitObjectDestruct(objDecl.objectDestruct, visitor);
      } else {
        visitor(objDecl.alias ?? objDecl.id!);
      }
    }
  }
}
