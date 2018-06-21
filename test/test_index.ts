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
      {ignoreGenerics: true, ignoreIndexSignature: false});
    const expected = await readFile(join(fixtures, "ignore-generics-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });

  it("should ignore index signature", async () => {
    const output = await Compiler.compile(join(fixtures, "ignore-index-signature.ts"),
      {ignoreGenerics: false, ignoreIndexSignature: true});
    const expected = await readFile(join(fixtures, "ignore-index-signature-ti.ts"), {encoding: "utf8"});
    assert.deepEqual(output, expected);
  });
});
