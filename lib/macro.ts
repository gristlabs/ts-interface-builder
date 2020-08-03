import * as path from "path";
import { MacroHandler, MacroError, createMacro } from "babel-plugin-macros";
import { Compiler, ICompilerOptions } from "./index";

const macroHandler: MacroHandler = (params) => {
  const callPaths = params.references["makeCheckers"];

  // Bail out if no calls in this file
  if (!callPaths || !callPaths.length) {
    return;
  }

  const {
    babel,
    state: { filename },
  } = params;

  // Rename any bindings to `t` in any parent scope of any call
  for (const callPath of callPaths) {
    let scope = callPath.scope;
    while (true) {
      if (scope.hasBinding("t")) {
        scope.rename("t");
      }
      if (!scope.parent || scope.parent === scope) {
        break;
      }
      scope = scope.parent;
    }
  }

  // Add `import * as t from 'ts-interface-checker'` statement
  const firstStatementPath = callPaths[0]
    .findParent((path) => path.isProgram())
    .get("body.0") as babel.NodePath;
  firstStatementPath.insertBefore(
    babel.types.importDeclaration(
      [babel.types.importNamespaceSpecifier(babel.types.identifier("t"))],
      babel.types.stringLiteral("ts-interface-checker")
    )
  );

  // Get the user config passed to us by babel-plugin-macros, for use as default options
  // Note: `config` property is missing in `babelPluginMacros.MacroParams` type definition
  const defaultOptions = ((params as any).config || {}) as ICompilerOptions;

  callPaths.forEach(({ parentPath }, callIndex) => {
    // Determine compiler parameters
    const getArgValue = getGetArgValue(callIndex, parentPath);
    const file = path.resolve(
      filename,
      "..",
      getArgValue(0) || path.basename(filename)
    );
    const options = {
      ...defaultOptions,
      ...(getArgValue(1) || {}),
      format: "js:cjs",
    };

    // Compile
    let compiled: string | undefined;
    try {
      compiled = Compiler.compile(file, options);
    } catch (error) {
      throw macroError(callIndex, `${error.name}: ${error.message}`);
    }

    // Get the compiled type suite as AST node
    const parsed = parse(compiled)!;
    if (parsed.type !== "File") throw macroInternalError();
    if (parsed.program.body[1].type !== "ExpressionStatement")
      throw macroInternalError();
    if (parsed.program.body[1].expression.type !== "AssignmentExpression")
      throw macroInternalError();
    const typeSuiteNode = parsed.program.body[1].expression.right;

    // Build checker suite expression using type suite
    const checkerSuiteNode = babel.types.callExpression(
      babel.types.memberExpression(
        babel.types.identifier("t"),
        babel.types.identifier("createCheckers")
      ),
      [typeSuiteNode]
    );

    // Replace call with checker suite expression
    parentPath.replaceWith(checkerSuiteNode);
  });

  function parse(code: string) {
    return babel.parse(code, { configFile: false });
  }

  function getGetArgValue(
    callIndex: number,
    callExpressionPath: babel.NodePath
  ) {
    const argPaths = callExpressionPath.get("arguments");
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
          callIndex,
          `Unable to evaluate argument ${argIndex + 1}`
        );
      }
      return value;
    };
  }
};

function macroError(callIndex: number, message: string): MacroError {
  return new MacroError(
    `ts-interface-builder/macro: makeCheckers call ${callIndex + 1}: ${message}`
  );
}

function macroInternalError(message?: string): MacroError {
  return new MacroError(
    `ts-interface-builder/macro: Internal Error: ${
      message || "Check stack trace"
    }`
  );
}

const macroParams = { configName: "ts-interface-builder" };

export const macro = () => createMacro(macroHandler, macroParams);
