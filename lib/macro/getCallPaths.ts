import { References } from "babel-plugin-macros";
import { NodePath, types } from "@babel/core"; // typescript types ONLY
import { macroError } from "./errors";

export function getCallPaths({
  getTypeSuite = [],
  getCheckers = [],
  ...rest
}: References) {
  const restKeys = Object.keys(rest);
  if (restKeys.length) {
    throw macroError(
      `Reference(s) to unknown export(s): ${restKeys.join(", ")}`
    );
  }
  const callPaths = {
    getTypeSuite: [] as NodePath<types.CallExpression>[],
    getCheckers: [] as NodePath<types.CallExpression>[],
  };
  getTypeSuite.forEach((path, index) => {
    if (!path.parentPath.isCallExpression()) {
      throw macroError(
        `Reference ${index + 1} to getTypeSuite not used for a call expression`
      );
    }
    callPaths.getTypeSuite.push(path.parentPath);
  });
  getCheckers.forEach((path, index) => {
    if (!path.parentPath.isCallExpression()) {
      throw macroError(
        `Reference ${index + 1} to getCheckers not used for a call expression`
      );
    }
    callPaths.getCheckers.push(path.parentPath);
  });
  return callPaths;
}
