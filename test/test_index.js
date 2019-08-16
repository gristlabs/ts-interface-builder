const chai = require('chai');

const path = require('path');
const { readFile } = require('fs-extra');
const { SchemaProgram } = require('../dist/index');

const { assert, expect } = chai;
const fixtures = path.join(__dirname, 'fixtures');

const schemaPath = (file) => path.relative('./', path.join(fixtures, file));

const expectSchema = async (input, files) => {
  const output = SchemaProgram.compile({ files: [schemaPath(input)] });

  const expected = await Promise.all(files.map(async (file) => {
    const realFile = schemaPath(file);
    return {
      schemaFile: realFile,
      content: await readFile(realFile, 'utf8')
    };
  }));

  assert.deepEqual(output, expected);
}

describe('ts-interface-builder', () => {
  it('should compile interface to runtime code', async () => {
    await expectSchema('sample.ts', ['sample-schema.ts']);
  });

  it('should fail generics', async () => {
    expect(() => SchemaProgram.compile({ files: [schemaPath('fail-generics.ts')]} ))
      .to.throw(Error, 'Generics are not yet supported by ts-joi-schema-generator: ITest<T>');
  });

  it('should compile index signature', async () => {
    await expectSchema('compile-index-signature.ts', ['compile-index-signature-schema.ts']);
  });

  it('should compile Array', async () => {
    await expectSchema('array.ts', ['array-schema.ts']);
  });

  it('should compile imports', async () => {
    await expectSchema('imports-parent.ts', [
      'imports-parent-schema.ts',
      'imports-child-a-schema.ts',
      'imports-child-b-schema.ts',
      'imports-child-c-schema.ts',
      'imports-child-d-schema.ts'
    ]);
  });
});
