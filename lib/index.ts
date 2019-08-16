import * as commander from 'commander';
import * as fs from 'fs-extra';
import * as Defaults from './defaults';

import { SchemaProgram, ICompilerOptions } from './SchemaProgram';
export { SchemaProgram, ICompilerOptions };

/**
 * Main entry point when used from the command line.
 */
export async function main() {
  commander
  .description('Create runtime validator module from TypeScript interfaces')
  .usage('[options] -- <tsc-options...>')
  .option('-s, --suffix <suffix>', `Suffix to append to generated files (default ${Defaults.suffix})`, Defaults.suffix)
  .option('-o, --outDir <path>', 'Directory for output files; same as source file if omitted')
  .allowUnknownOption()
  .parse(process.argv);

  const tscArgs: string[] = commander.args;
  const suffix: string = commander.suffix;
  const outDir: string|undefined = commander.outDir;
  const options: ICompilerOptions = {
    tsconfig: commander.config,
    outDir,
    suffix,
    //files: files.length === 0 ? undefined : files
    tscArgs: [...(commander.project ? ['-p', commander.project] : []), ...tscArgs]
  };

  const result = SchemaProgram.compile(options);
  await Promise.all(result.map((compileResult) => fs.outputFile(compileResult.schemaFile, compileResult.content)));
}
