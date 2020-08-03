import * as assert from "assert";
import {readFile} from "fs-extra";
import {join} from "path";
import * as ts from "typescript";
import * as babel from "@babel/core";
import * as macroPlugin from "babel-plugin-macros";

const fixtures = join(__dirname, "fixtures");

describe("ts-interface-builder/macro", () => {
    it("locals", async function () {
        this.timeout(5000)
        const file = join(fixtures, "macro-locals.ts");
        const output = babelCompile(tsCompile(await readFile(file, {encoding: "utf8"})), file);
        const expected = (await readFile(join(fixtures, "macro-locals.js"), { encoding: "utf8" })).trim();
        assert.equal(output, expected);
    });
    it("options", async function () {
        this.timeout(5000)
        const file = join(fixtures, "macro-options.ts");
        const output = babelCompile(tsCompile(await readFile(file, {encoding: "utf8"})), file);
        const expected = (await readFile(join(fixtures, "macro-options.js"), { encoding: "utf8" })).trim();
        assert.equal(output, expected);
    });
    it("error evaluating arguments", async function () {
        const file = join(fixtures, "macro-error-evaluating-arguments.ts");
        const tsOutput = tsCompile(await readFile(file, {encoding: "utf8"}));
        assert.throws(() => babelCompile(tsOutput, file), {
            name: "MacroError",
            message: `${file}: ts-interface-builder/macro: makeCheckers call 1: Unable to evaluate argument 1`,
        } as any);
    });
    it("error compiling", async function () {
        this.timeout(5000)
        const file = join(fixtures, "macro-error-compiling.ts");
        const tsOutput = tsCompile(await readFile(file, {encoding: "utf8"}));
        assert.throws(() => babelCompile(tsOutput, file), {
          name: "MacroError",
          message: `${file}: ts-interface-builder/macro: makeCheckers call 1: Error: Node IndexSignature not supported by ts-interface-builder: [extra: string]: any;`,
        } as any);
    });
});

function tsCompile (code: string): string {
    const compilerOptions: ts.CompilerOptions = {
        module: ts.ModuleKind.ES2015,
        inlineSourceMap: true,
    };
    const {outputText, diagnostics} = ts.transpileModule(code, {compilerOptions});
    if (diagnostics && diagnostics.length) {
        throw new Error('Got diagnostic errors: '+ JSON.stringify(diagnostics, null, 2));
    }
    return outputText;
}

function babelCompile (code: string, filename: string): string {
    return babel.transform(code, {
        babelrc: false,
        plugins: [[macroPlugin, {"ts-interface-builder": {inlineImports: true}}]],
        filename,
        // Note: Type definitions for @babel/core's TransformOptions.inputSourceMap is wrong; see https://babeljs.io/docs/en/options#source-map-options
        inputSourceMap: true as any,
    })!.code!;
}
