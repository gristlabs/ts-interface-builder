import * as assert from "assert";
import {readFile} from "fs-extra";
import {join} from "path";
import {Compiler} from "../lib/index";

const fixtures = join(__dirname, "fixtures");

describe("ts-interface-builder", () => {
  it("should compile interface to runtime code", async () => {
    const output = await Compiler.compile(join(fixtures, "sample.ts"));
    const expected = await readFile(join(fixtures, "sample-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should strip out promises", async () => {
    const output = await Compiler.compile(join(fixtures, "promises.ts"));
    const expected = await readFile(join(fixtures, "promises-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should ignore generics", async () => {
    const output = await Compiler.compile(join(fixtures, "ignore-generics.ts"),
      {ignoreGenerics: true});
    const expected = await readFile(join(fixtures, "ignore-generics-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should ignore index signature", async () => {
    const output = await Compiler.compile(join(fixtures, "ignore-index-signature.ts"),
      {ignoreIndexSignature: true});
    const expected = await readFile(join(fixtures, "ignore-index-signature-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should compile Array", async () => {
    const output = await Compiler.compile(join(fixtures, "array.ts"));
    const expected = await readFile(join(fixtures, "array-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should compile intersection types", async() => {
    const output = await Compiler.compile(join(fixtures, "intersection.ts"));
    const expected = await readFile(join(fixtures, "intersection-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  })

  it("should inline imports", async () => {
    const output = await Compiler.compile(join(fixtures, "imports-parent.ts"),
      {inlineImports: true});
    const expected = await readFile(join(fixtures, "imports-parent-ti.ts"), { encoding: "utf8" });
    assert.deepEqual(output, expected);
  });

  it("should not inline imports when option is not set", async () => {
    const output = await Compiler.compile(join(fixtures, "imports-parent.ts"));
    const expected = await readFile(join(fixtures, "imports-parent-shallow-ti.ts"), { encoding: "utf8" });
    assert.deepEqual(output, expected);
  });

  it("should compile to JS in esm module format", async () => {
    const output = await Compiler.compile(join(fixtures, "to-javascript.ts"),
        {format: 'js:esm'});
    const expected = await readFile(join(fixtures, "to-javascript-ti.esm.js"), {encoding: "utf8"});
    assert.equal(output, expected);
  });

  it("should compile to JS in cjs module format", async () => {
    const output = await Compiler.compile(join(fixtures, "to-javascript.ts"),
        {format: 'js:cjs'});
    const expected = await readFile(join(fixtures, "to-javascript-ti.cjs.js"), {encoding: "utf8"});
    assert.equal(output, expected);
  });
});
