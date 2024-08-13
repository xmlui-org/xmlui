// Represents the scope of a loop
export type LoopScope = {
  // Indicates that the current scope is a switch statement 
  isSwitch?: boolean;
  
  // The label of the action to go to when a "continue" statement is executed in the loop
  continueLabel: number;

  // The label of the action to go to when a "break" statement is executed in the loop
  breakLabel: number;

  // The depth of continue block scopes at the start of the loop
  continueBlockDepth: number;

  // The depth of break block scopes at the start of the loop
  breakBlockDepth: number;
  
  // The depth of try blocks at the start of the loop
  tryBlockDepth: number;
};
