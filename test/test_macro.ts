const UPDATE_SNAPSHOTS = false;

import * as assert from "assert";
import { readFile, writeFile } from "fs-extra";
import { join } from "path";
import * as ts from "typescript";
import * as babel from "@babel/core";
import * as macroPlugin from "babel-plugin-macros";

const fixtures = join(__dirname, "fixtures");

async function snapshot(output: string, snapshotFile: string) {
  if (UPDATE_SNAPSHOTS) {
    await writeFile(join(fixtures, snapshotFile), output);
  } else {
    const snapshot = (
      await readFile(join(fixtures, snapshotFile), { encoding: "utf8" })
    ).trim();
    assert.equal(output, snapshot);
  }
}

describe("ts-interface-builder/macro", () => {
  it("locals", async function () {
    this.timeout(5000);
    const file = join(fixtures, "macro-locals.ts");
    const output = babelCompile(
      tsCompile(await readFile(file, { encoding: "utf8" })),
      file
    );
    await snapshot(output, "macro-locals.js");
  });
  it("options", async function () {
    this.timeout(5000);
    const file = join(fixtures, "macro-options.ts");
    const output = babelCompile(
      tsCompile(await readFile(file, { encoding: "utf8" })),
      file
    );
    await snapshot(output, "macro-options.js");
  });
  it("error reference not called", async function () {
    const file = join(fixtures, "macro-error-reference-not-called.ts");
    const tsOutput = tsCompile(await readFile(file, { encoding: "utf8" }));
    assert.throws(() => babelCompile(tsOutput, file), {
      name: "MacroError",
      message: `${file}: ts-interface-builder/macro: Reference 1 to getCheckers not used for a call expression`,
    } as any);
  });
  it("error evaluating arguments", async function () {
    const file = join(fixtures, "macro-error-evaluating-arguments.ts");
    const tsOutput = tsCompile(await readFile(file, { encoding: "utf8" }));
    assert.throws(() => babelCompile(tsOutput, file), {
      name: "MacroError",
      message: `${file}: ts-interface-builder/macro: Unable to evaluate argument 1 of getCheckers call 1`,
    } as any);
  });
  it("error compiling", async function () {
    this.timeout(5000);
    const file = join(fixtures, "macro-error-compiling.ts");
    const tsOutput = tsCompile(await readFile(file, { encoding: "utf8" }));
    const errorCompilingFile = join(fixtures, "ignore-index-signature.ts");
    assert.throws(() => babelCompile(tsOutput, file), {
      name: "MacroError",
      message: `${file}: ts-interface-builder/macro: Error compiling file ${errorCompilingFile} with options {"inlineImports":true,"format":"js:cjs"}: Error: Node IndexSignature not supported by ts-interface-builder: [extra: string]: any;`,
    } as any);
  });
});

function tsCompile(code: string): string {
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.ES2015,
    inlineSourceMap: true,
  };
  const { outputText, diagnostics } = ts.transpileModule(code, {
    compilerOptions,
  });
  if (diagnostics && diagnostics.length) {
    throw new Error(
      "Got diagnostic errors: " + JSON.stringify(diagnostics, null, 2)
    );
  }
  return outputText;
}

function babelCompile(code: string, filename: string): string {
  return babel.transform(code, {
    babelrc: false,
    plugins: [
      [macroPlugin, { "ts-interface-builder": { inlineImports: true } }],
    ],
    filename,
    // Note: Type definitions for @babel/core's TransformOptions.inputSourceMap is wrong; see https://babeljs.io/docs/en/options#source-map-options
    inputSourceMap: true as any,
  })!.code!;
}
