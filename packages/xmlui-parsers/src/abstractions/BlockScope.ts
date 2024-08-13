// TODO: It should be internal to the execution engine and not be part of the scripting
// source tree

// Represents a block scope
export type BlockScope = {
  // --- Block-scoped variable values
  vars: Record<string, any>;

  // --- Block-scopes const values
  constVars?: Set<string>;

  // --- Optional return value of an expression
  returnValue?: any;
};

// Represents a parameter redirect to a "vars"
export type RedirectInfo = {
  valueScope: any;
  valueIndex: string | number;
}
