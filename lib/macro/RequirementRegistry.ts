// @ts-ignore
import { isDeepStrictEqual } from "util";
import { ICompilerArgs } from "./compileTypeSuite";

export interface IRequiredTypeSuite {
  compilerArgs: ICompilerArgs;
  id: string;
}

export interface IRequiredCheckerSuite {
  typeSuiteId: string;
  id: string;
}

export class RequirementRegistry {
  public typeSuites: IRequiredTypeSuite[] = [];
  public checkerSuites: IRequiredCheckerSuite[] = [];

  public requireTypeSuite(compilerArgs: ICompilerArgs): string {
    let index = this.typeSuites.findIndex((typeSuite) =>
      isDeepStrictEqual(typeSuite.compilerArgs, compilerArgs)
    );
    if (index === -1) {
      index = this.typeSuites.length;
      this.typeSuites.push({
        compilerArgs,
        id: `typeSuite${index}`,
      });
    }
    return this.typeSuites[index].id;
  }

  public requireCheckerSuite(compilerArgs: ICompilerArgs): string {
    const typeSuiteId = this.requireTypeSuite(compilerArgs);
    let index = this.checkerSuites.findIndex(
      (checkerSuite) => checkerSuite.typeSuiteId === typeSuiteId
    );
    if (index === -1) {
      index = this.checkerSuites.length;
      this.checkerSuites.push({
        typeSuiteId,
        id: `checkerSuite${index}`,
      });
    }
    return this.checkerSuites[index].id;
  }
}
