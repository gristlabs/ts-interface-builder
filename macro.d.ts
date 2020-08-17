import { ICompilerOptions } from "."
import { ICheckerSuite, ITypeSuite } from "ts-interface-checker"

/**
 * Returns a type suite compiled from the given module with the given compiler options
 * @param modulePath - Relative path to the target module (defaults to the module in which the function is called)
 * @param options - Compiler options
 */
export declare function getTypeSuite (modulePath?: string, options?: ICompilerOptions): ITypeSuite

/**
 * Returns a checker suite created from a type suite compiled from the given module with the given compiler options
 * @param modulePath - Relative path to the target module (defaults to the module in which the function is called)
 * @param options - Compiler options
 */
export declare function getCheckers (modulePath?: string, options?: ICompilerOptions): ICheckerSuite
