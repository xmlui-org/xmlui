// A function that resolves a module name to the text of the module
export type ModuleResolver = (
  sourceModule: string,
  moduleName: string
) => string | null;
