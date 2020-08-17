import { NodePath, types } from "@babel/core"; // typescript types ONLY
import { macroError, macroInternalError } from "./errors";

export function getGetArgValue(
  callPath: NodePath<types.CallExpression>,
  callDescription: string
) {
  const argPaths = callPath.get("arguments");
  if (!Array.isArray(argPaths)) throw macroInternalError();
  return (argIndex: number): any => {
    const argPath = argPaths[argIndex];
    if (!argPath) {
      return null;
    }
    const { confident, value } = argPath.evaluate();
    if (!confident) {
      /**
       * TODO: Could not get following line to work:
       * const lineSuffix = argPath.node.loc ? ` on line ${argPath.node.loc.start.line}` : ""
       * Line number displayed is for the intermediary js produced by typescript.
       * Even with `inputSourceMap: true`, Babel doesn't seem to parse inline sourcemaps in input.
       * Maybe babel-plugin-macros doesn't support "input -> TS -> babel -> output" pipeline?
       * Or maybe I'm doing that pipeline wrong?
       */
      throw macroError(
        `Unable to evaluate argument ${argIndex + 1} of ${callDescription}`
      );
    }
    return value;
  };
}
