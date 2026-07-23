import {
  T_EXPRESSION_STATEMENT,
  T_LITERAL,
  type ExpressionStatement,
  type Statement,
} from "../script-runner/ScriptingSourceTree";

export type EventHandlerExecutionMode = "async" | "sync";
export type EventHandlerSchedulingDirective = "queue" | "block";

export type EventHandlerDirectiveWarningCode =
  | "handler-directive-conflict"
  | "handler-directive-sync-async-call";

export type EventHandlerDirectiveWarning = {
  code: EventHandlerDirectiveWarningCode;
  message: string;
};

export type EventHandlerDirectiveInfo = {
  executionMode?: EventHandlerExecutionMode;
  scheduling?: EventHandlerSchedulingDirective;
  consumedCount: number;
  warnings: EventHandlerDirectiveWarning[];
};

const EXECUTION_DIRECTIVES = new Set(["async", "sync"]);
const SCHEDULING_DIRECTIVES = new Set(["queue", "block"]);

export function extractEventHandlerDirectives(statements: Statement[]): {
  directives: EventHandlerDirectiveInfo;
  executableStatements: Statement[];
} {
  const directives: EventHandlerDirectiveInfo = {
    consumedCount: 0,
    warnings: [],
  };

  for (const statement of statements) {
    const value = getDirectiveLiteralValue(statement);
    if (!value || (!EXECUTION_DIRECTIVES.has(value) && !SCHEDULING_DIRECTIVES.has(value))) {
      break;
    }

    directives.consumedCount++;
    if (value === "async" || value === "sync") {
      if (directives.executionMode && directives.executionMode !== value) {
        directives.warnings.push({
          code: "handler-directive-conflict",
          message: `Conflicting event handler execution directives: '${directives.executionMode}' and '${value}'. The last directive wins.`,
        });
      }
      directives.executionMode = value;
      continue;
    }

    const scheduling = value as EventHandlerSchedulingDirective;
    if (directives.scheduling && directives.scheduling !== scheduling) {
      directives.warnings.push({
        code: "handler-directive-conflict",
        message: `Conflicting event handler scheduling directives: '${directives.scheduling}' and '${scheduling}'. The last directive wins.`,
      });
    }
    directives.scheduling = scheduling;
  }

  return {
    directives,
    executableStatements: statements.slice(directives.consumedCount),
  };
}

function getDirectiveLiteralValue(statement: Statement): string | undefined {
  if (statement.type !== T_EXPRESSION_STATEMENT) {
    return undefined;
  }
  const expr = (statement as ExpressionStatement).expr;
  if (expr.type !== T_LITERAL || typeof expr.value !== "string") {
    return undefined;
  }
  return expr.value;
}
