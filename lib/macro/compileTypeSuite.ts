import { Compiler, ICompilerOptions } from "../index";
import { macroError, macroInternalError } from "./errors";

export type ICompilerArgs = [string, ICompilerOptions];

export function compileTypeSuite(args: ICompilerArgs): string {
  let compiled: string | undefined;
  const [file, options] = args;
  const optionsString = JSON.stringify(options);
  const context = `compiling file ${file} with options ${optionsString}`;
  try {
    compiled = Compiler.compile(file, options);
  } catch (error) {
    throw macroError(`Error ${context}: ${error.name}: ${error.message}`);
  }
  const exportStatement = compiled.split("\n").slice(2).join("\n");
  const prefix = "module.exports = ";
  if (exportStatement.substr(0, prefix.length) !== prefix) {
    throw macroInternalError(
      `Unexpected output format from Compiler (${context})`
    );
  }
  return exportStatement.substr(prefix.length);
}
