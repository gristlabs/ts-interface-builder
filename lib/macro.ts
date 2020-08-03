// @ts-ignore
import * as path from "path";
import { createMacro, MacroHandler } from "babel-plugin-macros";
import { NodePath, types } from "@babel/core"; // typescript types ONLY
import { ICompilerOptions } from "./index";
import { getCallPaths } from "./macro/getCallPaths";
import { RequirementRegistry } from "./macro/RequirementRegistry";
import { getGetArgValue } from "./macro/getGetArgValue";
import { compileTypeSuite, ICompilerArgs } from "./macro/compileTypeSuite";
import { macroInternalError } from "./macro/errors";

const tsInterfaceCheckerIdentifier = "t";
const onceIdentifier = "once";

/**
 * This function is called for each file that imports the macro module.
 * `params.references` is an object where each key is the name of a variable imported from the macro module,
 * and each value is an array of references to that that variable.
 * Said references come in the form of Babel `NodePath`s,
 * which have AST (Abstract Syntax Tree) data and methods for manipulating it.
 * For more info: https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/author.md#function-api
 */
const macroHandler: MacroHandler = (params) => {
  const { references, babel, state } = params;
  const callPaths = getCallPaths(references);
  const somePath = callPaths.getTypeSuite[0] || callPaths.getCheckers[0];
  if (!somePath) {
    return;
  }
  const programPath = somePath.findParent((path) => path.isProgram());

  const registry = new RequirementRegistry();
  const toReplace = [
    ...callPaths.getTypeSuite.map((callPath, index) => {
      const compilerArgs = getCompilerArgs(callPath, "getTypeSuite", index);
      const typeSuiteId = registry.requireTypeSuite(compilerArgs);
      return { callPath, id: typeSuiteId };
    }),
    ...callPaths.getCheckers.map((callPath, index) => {
      const compilerArgs = getCompilerArgs(callPath, "getCheckers", index);
      const checkerSuiteId = registry.requireCheckerSuite(compilerArgs);
      return { callPath, id: checkerSuiteId };
    }),
  ];

  // Begin mutations

  programPath.scope.rename(tsInterfaceCheckerIdentifier);
  programPath.scope.rename(onceIdentifier);
  toReplace.forEach(({ callPath, id }) => {
    scopeRenameRecursive(callPath.scope, id);
  });

  const toPrepend = `
    import * as ${tsInterfaceCheckerIdentifier} from "ts-interface-checker";
    function ${onceIdentifier}(fn) {
      var result;
      return function () {
        return result || (result = fn());
      };
    }
    ${registry.typeSuites
      .map(
        ({ compilerArgs, id }) => `
          var ${id} = ${onceIdentifier}(function(){
            return ${compileTypeSuite(compilerArgs)}
          });
        `
      )
      .join("")}
    ${registry.checkerSuites
      .map(
        ({ typeSuiteId, id }) => `
          var ${id} = ${onceIdentifier}(function(){
            return ${tsInterfaceCheckerIdentifier}.createCheckers(${typeSuiteId}());
          });
        `
      )
      .join("")}
  `;
  parseStatements(toPrepend).reverse().forEach(prependProgramStatement);

  const { identifier, callExpression } = babel.types;
  toReplace.forEach(({ callPath, id }) => {
    callPath.replaceWith(callExpression(identifier(id), []));
  });

  // Done mutations (only helper functions below)

  function getCompilerArgs(
    callPath: NodePath<types.CallExpression>,
    functionName: string,
    callIndex: number
  ): ICompilerArgs {
    const callDescription = `${functionName} call ${callIndex + 1}`;
    const getArgValue = getGetArgValue(callPath, callDescription);

    const basename = getArgValue(0) || path.basename(state.filename);
    const file = path.resolve(state.filename, "..", basename);

    // Get the user config passed to us by babel-plugin-macros, for use as default options
    // Note: `config` property is missing in `babelPluginMacros.MacroParams` type definition
    const defaultOptions = (params as any).config;
    const options = {
      ...(defaultOptions || {}),
      ...(getArgValue(1) || {}),
      format: "js:cjs",
    } as ICompilerOptions;

    return [file, options];
  }

  function scopeRenameRecursive(scope: NodePath["scope"], oldName: string) {
    scope.rename(oldName);
    if (scope.parent) {
      scopeRenameRecursive(scope.parent, oldName);
    }
  }

  function parseStatements(code: string) {
    const parsed = babel.parse(code, { configFile: false });
    if (!parsed || parsed.type !== "File") throw macroInternalError();
    return parsed.program.body;
  }

  function prependProgramStatement(statement: types.Statement) {
    (programPath.get("body.0") as NodePath).insertBefore(statement);
  }
};

const macroParams = { configName: "ts-interface-builder" };

export const macro = () => createMacro(macroHandler, macroParams);
