// tslint:disable:no-console

import * as commander from "commander";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

// Default suffix appended to generated files. Abbreviation for "ts-interface".
const defaultSuffix = "-ti";

// TODO: Use a class-based interface, as well as replacing big if-else chain with swich.
export class Compiler {
  public static compile(filePath: string): string {
    const options = {target: ts.ScriptTarget.Latest, module: ts.ModuleKind.CommonJS};
    const program = ts.createProgram([filePath], options);
    const checker = program.getTypeChecker();
    return new Compiler(checker).compileNode(program.getSourceFile(filePath));
  }

  constructor(private checker: ts.TypeChecker) {
  }

  private compileNode(node: ts.Node): string {
    return this.getName(node);
  }

  private getName(id: ts.Node): string {
    const symbol = this.checker.getSymbolAtLocation(id);
    return symbol ? symbol.getName() : "unknown";
  }
}

function collectDiagnostics(program: ts.Program) {
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return ts.formatDiagnostics(diagnostics, {
    getCurrentDirectory() { return process.cwd(); },
    getCanonicalFileName(fileName: string) { return fileName; },
    getNewLine() { return "\n"; },
  });
}

export function compileToRuntime(filePath: string) {
  const options = {target: ts.ScriptTarget.Latest, module: ts.ModuleKind.CommonJS};
  const program = ts.createProgram([filePath], options);
  const checker = program.getTypeChecker();
  const topNode: ts.Node = program.getSourceFile(filePath);
  if (!topNode) {
    throw new Error(`Can't process ${filePath}: ${collectDiagnostics(program)}`);
  }
  return processNode(topNode);

  function getName(id: ts.Node): string {
    const symbol = checker.getSymbolAtLocation(id);
    return symbol ? symbol.getName() : "unknown";
  }

  function indent(content: string): string {
    return content.replace(/\n/g, "\n  ");
  }

  function processNode(node: ts.Node): string {
    if (ts.isSourceFile(node)) {
      return node.statements.map(processNode).filter((s) => s).join("\n") + "\n";
    } else if (ts.isInterfaceDeclaration(node)) {
      const name = getName(node.name);
      const members = node.members.map((n) => "  " + indent(processNode(n)) + ",\n").join("");
      // typeParameters?: NodeArray<TypeParameterDeclaration>;
      const extend: string[] = [];
      if (node.heritageClauses) {
        for (const h of node.heritageClauses) {
          extend.push(...h.types.map(processNode));
        }
      }
      return `export ${name} = t.iface([${extend.join(", ")}], {\n${members}});`;
    } else if (ts.isTypeAliasDeclaration(node)) {
      const name = getName(node.name);
      return `export ${name} = ${processNode(node.type)};`;
    } else if (ts.isPropertySignature(node)) {
      const name = getName(node.name);
      const question = node.questionToken ? "?" : "";
      return `"${name}${question}": ${processNode(node.type!)}`;
    } else if (ts.isIdentifier(node)) {
      const name = getName(node);
      return `"${name}"`;
    } else if (ts.isTypeReferenceNode(node)) {
      const name = getName(node.typeName);
      return `"${name}"`;
    } else if (ts.isArrayTypeNode(node)) {
      return `t.array(${processNode(node.elementType)})`;
    } else if (ts.isTupleTypeNode(node)) {
      const members = node.elementTypes.map(processNode);
      return `t.tuple(${members.join(", ")})`;
    } else if (ts.isUnionTypeNode(node)) {
      const members = node.types.map(processNode);
      return `t.union(${members.join(", ")})`;
    } else if (ts.isTypeLiteralNode(node)) {
      const members = node.members.map((n) => "  " + indent(processNode(n)) + ",\n").join("");
      return `t.iface([], {\n${members}})`;
    } else if (ts.isParameter(node)) {
      const name = getName(node.name);
      const question = node.questionToken ? "?" : "";
      return `{"${name}${question}": ${processNode(node.type!)}}`;
    } else if (ts.isFunctionTypeNode(node)) {
      const params = node.parameters.map(processNode).join(", ");
      return `t.func([${params}], ${processNode(node.type!)})`;
    } else if (ts.isMethodSignature(node)) {
      const name = getName(node.name);
      const params = node.parameters.map(processNode).join(", ");
      return `"${name}": t.func([${params}], ${processNode(node.type!)})`;
    } else if (ts.isSourceFile(node.parent!)) {
      // Skip top-level statements that we haven't handled.
      return "";
    } else if (ts.isExpressionWithTypeArguments(node)) {
      return processNode(node.expression);
    } else {
      switch (node.kind) {
        case ts.SyntaxKind.AnyKeyword: return '"any"';
        case ts.SyntaxKind.NumberKeyword: return '"number"';
        case ts.SyntaxKind.ObjectKeyword: return '"object"';
        case ts.SyntaxKind.BooleanKeyword: return '"boolean"';
        case ts.SyntaxKind.StringKeyword: return '"string"';
        case ts.SyntaxKind.SymbolKeyword: return '"symbol"';
        case ts.SyntaxKind.ThisKeyword: return '"this"';
        case ts.SyntaxKind.VoidKeyword: return '"void"';
        case ts.SyntaxKind.UndefinedKeyword: return '"undefined"';
        case ts.SyntaxKind.NullKeyword: return '"null"';
        case ts.SyntaxKind.NeverKeyword: return '"never"';
      }
    }
    throw new Error(`Node ${ts.SyntaxKind[node.kind]} not supported here`);
  }
}

/**
 * Main entry point when used from the command line.
 */
export function main() {
  commander
  .description("Create runtime validator module from TypeScript interfaces")
  .usage("[options] <typescript-file...>")
  .option("-s, --suffix <suffix>", `Suffix to append to generated files (default ${defaultSuffix})`, defaultSuffix)
  .option("-v, --verbose", "Produce verbose output")
  .parse(process.argv);

  const files: string[] = commander.args;
  // const verbose: boolean = commander.verbose;
  const suffix: string = commander.suffix;

  for (const filePath of files) {
    // Read and parse the source file.
    const ext = path.extname(filePath);
    const outPath = path.basename(filePath, ext) + suffix + ext;
    // const source = fs.readFileSync(filePath, {encoding: "utf8"});
    // const parsed = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, /*setParentNodes */ true);

    const runtimeCode = compileToRuntime(filePath);
    console.log("DESTINATION", outPath);
    console.log("RESULT", runtimeCode);
    fs.writeFileSync(outPath, runtimeCode);

    // Process the file.
    // processFile(sourceFile);
  }
  process.exit(0);
}
