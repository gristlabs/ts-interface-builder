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
  /*
    Here we have `compiled` in "js:cjs" format.
    From this string we need to extract the type suite expression that is exported.
    The format is expected to have only two statements:
    1. a cjs-style import statement which defines `t`, e.g. `const t = require("ts-interface-checker")`
    2. beginning on 3rd line, a cjs-style export statement that starts with `module.exports = ` and ends with `;\n`
  */
  const exportStatement = compiled.split("\n").slice(2).join("\n");
  const prefix = "module.exports = ";
  const postfix = ";\n";
  if (
    !exportStatement.startsWith(prefix) ||
    !exportStatement.endsWith(postfix)
  ) {
    throw macroInternalError(
      `Unexpected output format from Compiler (${context})`
    );
  }
  return exportStatement.slice(prefix.length, -postfix.length);
}
