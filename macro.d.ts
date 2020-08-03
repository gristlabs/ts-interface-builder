import { ICompilerOptions } from "."
import { ICheckerSuite, ITypeSuite } from "ts-interface-checker"
export declare function getCheckers (modulePath?: string, options?: ICompilerOptions): ICheckerSuite
export declare function getTypeSuite (modulePath?: string, options?: ICompilerOptions): ITypeSuite
