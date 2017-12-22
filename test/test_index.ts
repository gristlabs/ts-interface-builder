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
});
