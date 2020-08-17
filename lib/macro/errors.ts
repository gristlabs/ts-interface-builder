import {MacroError} from "babel-plugin-macros";

export function macroError(message: string): MacroError {
    return new MacroError(`ts-interface-builder/macro: ${message}`);
}

export function macroInternalError(message?: string): MacroError {
    return macroError(`Internal Error: ${message || "Check stack trace"}`);
}
