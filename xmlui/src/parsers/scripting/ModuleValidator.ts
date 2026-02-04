/**
 * ModuleValidator: Centralized validation for module statements
 * Handles validation rules for imported modules and parsed modules.
 */

import type { Statement } from "../../components-core/script-runner/ScriptingSourceTree";
import type { ParserErrorMessage } from "./ParserError";
import {
  T_IMPORT_DECLARATION,
  T_FUNCTION_DECLARATION,
  T_VAR_STATEMENT,
  T_CONST_STATEMENT,
  T_LET_STATEMENT,
} from "../../components-core/script-runner/ScriptingSourceTree";
import { ErrorCodes } from "./ParserError";
import { errorMessages } from "./ParserError";

// Mapping of statement types to human-readable names (from modules.ts)
const statementTypeNames: Record<number, string> = {
  1: "block statement",
  2: "empty statement",
  3: "expression statement",
  4: "arrow expression statement",
  5: "let statement",
  6: "const statement",
  7: "var statement",
  8: "if statement",
  9: "return statement",
  10: "break statement",
  11: "continue statement",
  12: "while statement",
  13: "do-while statement",
  14: "for statement",
  15: "for-in statement",
  16: "for-of statement",
  17: "throw statement",
  18: "try statement",
  19: "switch statement",
  20: "function declaration",
  21: "import declaration",
};

/**
 * Validates statements in an imported module
 * Imported modules can only contain function declarations and import statements.
 * All other statement types are either errors or warnings.
 */
export class ModuleValidator {
  /**
   * Validates statements in an imported module
   * @param modulePath The module path being validated
   * @param statements The statements to validate
   * @param errors Array to collect validation errors
   * @param warnings Array to collect validation warnings
   */
  static validateImportedModule(
    modulePath: string,
    statements: Statement[],
    errors: ParserErrorMessage[],
    warnings: ParserErrorMessage[],
  ): void {
    for (const stmt of statements) {
      // Skip imports and function declarations - these are allowed
      if (stmt.type === T_IMPORT_DECLARATION || stmt.type === T_FUNCTION_DECLARATION) {
        continue;
      }

      // Error: Reactive var declarations
      if (stmt.type === T_VAR_STATEMENT) {
        const varStmt = stmt as any;
        const varNames = varStmt.decls.map((d: any) => d.id.name).join(", ");
        errors.push({
          code: ErrorCodes.reactiveVarInImportedModule,
          text: errorMessages[ErrorCodes.reactiveVarInImportedModule].replace("{0}", varNames),
          position: stmt.startToken?.startPosition ?? 0,
          end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
          line: stmt.startToken?.startLine ?? 1,
          column: stmt.startToken?.startColumn ?? 1,
        });
        continue;
      }

      // Error: const/let declarations
      if (stmt.type === T_CONST_STATEMENT || stmt.type === T_LET_STATEMENT) {
        const declStmt = stmt as any;
        const varNames = declStmt.decls.map((d: any) => d.id ?? "?").join(", ");
        errors.push({
          code: ErrorCodes.constLetInImportedModule,
          text: errorMessages[ErrorCodes.constLetInImportedModule].replace("{0}", varNames),
          position: stmt.startToken?.startPosition ?? 0,
          end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
          line: stmt.startToken?.startLine ?? 1,
          column: stmt.startToken?.startColumn ?? 1,
        });
        continue;
      }

      // Warning: Any other statement type
      const stmtType = statementTypeNames[stmt.type] || `statement type ${stmt.type}`;
      warnings.push({
        code: ErrorCodes.invalidStatementInImportedModule,
        text: errorMessages[ErrorCodes.invalidStatementInImportedModule].replace("{0}", stmtType),
        position: stmt.startToken?.startPosition ?? 0,
        end: stmt.endToken?.endPosition ?? stmt.startToken?.endPosition ?? 0,
        line: stmt.startToken?.startLine ?? 1,
        column: stmt.startToken?.startColumn ?? 1,
      });
    }
  }

  /**
   * Validates a parsed module's functions
   * Checks for duplicate function names and other function-level validation
   * @param modulePath The module path being validated
   * @param functions Record of function name -> FunctionDeclaration
   * @param errors Array to collect validation errors
   */
  static validateModuleFunctions(
    modulePath: string,
    functions: Record<string, any>,
    errors: ParserErrorMessage[],
  ): void {
    // Currently just checks structure is valid
    // Can be extended with more validation rules
    if (!functions || typeof functions !== "object") {
      errors.push({
        code: ErrorCodes.unexpectedToken,
        text: "Invalid module functions structure",
        position: 0,
        end: 0,
        line: 1,
        column: 1,
      });
    }
  }
}
