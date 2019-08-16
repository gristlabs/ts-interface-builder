import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as Defaults from './defaults';
import { IContextTags, SchemaBuilder, SchemaType, IMemberDeclaration, INamedBinding } from './SchemaBuilder';

/** @schema */
export interface ICompilerOptions {
  tscArgs: readonly string[]
  tsconfig?: string
  outDir?: string
  fileSuffix?: string
  schemaSuffix?: string
}

interface ICompilerContext {
  schema: SchemaBuilder
  tags?: IContextTags
}

interface ICompilationResult {
  schemaFile: string
  content: string
}

interface ITagsOptions {
  [key: string]: 'exists' | 'value'
}

type TagsResult<T extends ITagsOptions> = {
  [K in keyof T]?:
  T[K] extends 'exists' ? boolean :
  T[K] extends 'value' ? string :
  never
}

export class SchemaProgram {
  private options: ICompilerOptions;

  private program: ts.Program;
  private checker: ts.TypeChecker;

  private schemas = new Map<string, SchemaBuilder>();
  private contexts: ICompilerContext[] = [];

  public static compile(options: ICompilerOptions) {
    const config = SchemaProgram.getParsedCommandLine(options);
    const program = ts.createProgram(config.fileNames, config.options);
    const compiler = new SchemaProgram(options, program);
    return compiler.compile();
  }

  private static getParsedCommandLine(options: ICompilerOptions): ts.ParsedCommandLine {
    let pcl = ts.parseCommandLine(options.tscArgs, (path: string) => fs.readFileSync(path, 'utf8'));
    if (pcl.options.project) {
      pcl = ts.getParsedCommandLineOfConfigFile(pcl.options.project, { }, {
        readFile: ts.sys.readFile,
        fileExists: ts.sys.fileExists,
        readDirectory: ts.sys.readDirectory,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        onUnRecoverableConfigFileDiagnostic: (d) => { },
        useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames
      }) || pcl;
    }
    pcl.options.outDir = undefined;
    pcl.options.out = undefined;
    return pcl;
  }

  private constructor(options: ICompilerOptions, program: ts.Program) {
    this.options = options;
    this.program = program;
    this.checker = program.getTypeChecker();
  }

  private get context() {
    return this.contexts[this.contexts.length - 1];
  }

  private get schema() {
    return this.context.schema;
  }

  private compile() {
    for (const file of this.program.getRootFileNames()) {
      const sourceFile = this.program.getSourceFile(file)!;
      this.compileNode(sourceFile);
    }

    for (const [, schema] of this.schemas) {
      schema.finalize();
    }

    const result: ICompilationResult[] = [];
    for (const [file, schema] of this.schemas) {
      const content = schema.render();
      if (content) {
        const { dir, name } = path.parse(file);
        const outFile = path.format({ dir: this.options.outDir || dir, name: `${name}${this.options.fileSuffix || Defaults.fileSuffix}`, ext: '.ts' });
        result.push({ schemaFile: path.relative('./', outFile), content: content });
      }
    }
    return result;
  }

  public use(file: string, name: string) {
    const schema = this.getSchema(file);
    if (schema) {
      schema.use(name);
      return;
    }
    throw new Error(`Couldn't find schema for: ${file}`);
  }

  private getSchema(file: string) {
    const permutations = ['', '.ts'];
    for (const permutation of permutations) {
      const schema = this.schemas.get(`${file}${permutation}`);
      if (schema) {
        return schema;
      }
    }
    return undefined;
  }

  private getName(node: ts.Node): string {
    const symbol = this.checker.getSymbolAtLocation(node);
    return symbol ? symbol.getName() : 'unknown';
  }

  private compileNode(node: ts.Node): void {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile: return this.compileSourceFile(node as ts.SourceFile);

      case ts.SyntaxKind.EnumDeclaration: return this.compileEnumDeclaration(node as ts.EnumDeclaration);
      case ts.SyntaxKind.InterfaceDeclaration: return this.compileInterfaceDeclaration(node as ts.InterfaceDeclaration);
      case ts.SyntaxKind.TypeAliasDeclaration: return this.compileTypeAliasDeclaration(node as ts.TypeAliasDeclaration);
      case ts.SyntaxKind.ExportDeclaration: return this.compileExportDeclaration(node as ts.ExportDeclaration);
      case ts.SyntaxKind.ImportDeclaration: return this.compileImportDeclaration(node as ts.ImportDeclaration);
    }
    // Skip top-level statements that we haven't handled.
    if (ts.isSourceFile(node.parent!)) { return; }
    console.warn(`compileNode ${ts.SyntaxKind[node.kind]} not supported by ts-joi-schema-generator: ${node.getText()}`);
  }

  private compileOptType(typeNode: ts.Node | undefined): SchemaType {
    return typeNode ? this.compileType(typeNode) : { type: 'any' };
  }

  private compileTypeElements(members: ts.NodeArray<ts.TypeElement>) {
    return members.map((member) => this.compileTypeElement(member));
  }

  private compileTypeElement(node: ts.TypeElement): IMemberDeclaration {
    switch (node.kind) {
      case ts.SyntaxKind.PropertySignature: return this.compilePropertySignature(node as ts.PropertySignature);
      case ts.SyntaxKind.IndexSignature: return this.compileIndexSignatureDeclaration(node as ts.IndexSignatureDeclaration);
      case ts.SyntaxKind.MethodSignature: return this.compileMethodSignature(node as ts.MethodSignature);
    }
    throw new Error(`Unsupported type element ${ts.SyntaxKind[node.kind]}: ${node.getText()}`);
  }

  private compilePropertySignature(node: ts.PropertySignature): IMemberDeclaration {
    this.context.tags = this.getTags(node, {
      regex: 'value',
      integer: 'exists',
      min: 'value',
      max: 'value'
    });

    const name = this.getName(node.name);
    const type = this.compileOptType(node.type);

    this.context.tags = undefined;
    return { name, type, required: !node.questionToken };
  }

  private compileIndexSignatureDeclaration(node: ts.IndexSignatureDeclaration): IMemberDeclaration {
    const regex = this.getTag(node, 'regex');
    const indexerType = this.compileOptType(node.parameters[0].type);
    return {
      name: 'indexer',
      indexer: (
        indexerType.type === 'string'
          ? { type: 'string' as const, regex: regex && regex.comment ? regex.comment.trim() : undefined }
          : { type: 'number' as const }
      ),
      type: this.compileOptType(node.type),
      required: !node.questionToken
    };
  }

  private compileMethodSignature(node: ts.MethodSignature): IMemberDeclaration {
    return {
      type: { type: 'func' },
      name: this.getName(node.name),
      required: !node.questionToken,
    }
  }

  private compileTypes(types: ts.NodeArray<ts.Node>) {
    return types.map((type) => this.compileType(type));
  }

  private compileType(node: ts.Node): SchemaType {
    switch (node.kind) {
      case ts.SyntaxKind.Identifier: return this.compileIdentifier(node as ts.Identifier);
      case ts.SyntaxKind.TypeReference: return this.compileTypeReferenceNode(node as ts.TypeReferenceNode);
      case ts.SyntaxKind.FunctionType: return this.compileFunctionTypeNode(node as ts.FunctionTypeNode);
      case ts.SyntaxKind.TypeLiteral: return this.compileTypeLiteralNode(node as ts.TypeLiteralNode);
      case ts.SyntaxKind.ArrayType: return this.compileArrayTypeNode(node as ts.ArrayTypeNode);
      case ts.SyntaxKind.TupleType: return this.compileTupleTypeNode(node as ts.TupleTypeNode);
      case ts.SyntaxKind.UnionType: return this.compileUnionTypeNode(node as ts.UnionTypeNode);
      case ts.SyntaxKind.OptionalType: return this.compileOptionalType(node as ts.OptionalTypeNode);
      case ts.SyntaxKind.LiteralType: return this.compileLiteralTypeNode(node as ts.LiteralTypeNode);
      case ts.SyntaxKind.IntersectionType: return this.compileIntersectionTypeNode(node as ts.IntersectionTypeNode);
      case ts.SyntaxKind.ParenthesizedType: return this.compileParenthesizedTypeNode(node as ts.ParenthesizedTypeNode);
      case ts.SyntaxKind.ExpressionWithTypeArguments: return this.compileExpressionWithTypeArguments(node as ts.ExpressionWithTypeArguments);
      case ts.SyntaxKind.TypeOperator: return this.compileTypeOperator(node as ts.TypeOperatorNode);

      case ts.SyntaxKind.AnyKeyword: return { type: 'any' };
      case ts.SyntaxKind.NullKeyword: return { type: 'null' };
      case ts.SyntaxKind.NeverKeyword: return { type: 'never' };
      case ts.SyntaxKind.SymbolKeyword: return { type: 'symbol' };
      case ts.SyntaxKind.ObjectKeyword: return { type: 'object' };
      case ts.SyntaxKind.BooleanKeyword: return { type: 'boolean' };
      case ts.SyntaxKind.UndefinedKeyword: return { type: 'undefined' };
      case ts.SyntaxKind.StringKeyword: return { type: 'string', regex: this.getTagOption('regex') };
      case ts.SyntaxKind.NumberKeyword: return {
        type: 'number',
        integer: this.getTagOption('integer'),
        min: this.getTagOption('min'),
        max: this.getTagOption('max')
      };
    }
    throw new Error(`compileType ${ts.SyntaxKind[node.kind]} not supported by ts-joi-schema-generator: ${node.getText()}`);
  }

  private getTagOption<T extends keyof IContextTags>(key: T): IContextTags[T] {
    return this.context.tags && this.context.tags[key];
  }

  private compileIdentifier(node: ts.Identifier): SchemaType {
    return { type: 'type-reference', name: this.getName(node) };
  }

  private compileTypeReferenceNode(node: ts.TypeReferenceNode): SchemaType {
    if (!node.typeArguments) {
      /*if (node.typeName.kind === ts.SyntaxKind.QualifiedName) {
        const typeNode = this.checker.getTypeFromTypeNode(node);
        if (typeNode.flags & ts.TypeFlags.EnumLiteral) {
          return `t.enumlit('${node.typeName.left.getText()}', '${node.typeName.right.getText()}')`;
        }
      }*/
      switch (node.typeName.getText()) {
        case 'Date': return { type: 'date' };
        case 'Buffer': return { type: 'buffer' };
      }
      return this.compileTypeName(node.typeName);
    } else if (node.typeName.getText() === 'Array') {
      return { type: 'array', of: this.compileType(node.typeArguments[0]) };
    } else {
      throw new Error(`Generics are not yet supported by ts-joi-schema-generator: ${node.getText()}`);
    }
  }

  private compileTypeName(node: ts.EntityName): SchemaType {
    switch (node.kind) {
      case ts.SyntaxKind.Identifier: return { type: 'type-reference', name: node.getText() };
      case ts.SyntaxKind.FirstNode: return { type: 'type-access', name: node.left.getText(), access: node.right.getText() }
    }
    throw new Error(`compileTypeName Unknown entityName ${ts.SyntaxKind[node!.kind]}`);
  }

  private compileFunctionTypeNode(node: ts.FunctionTypeNode): SchemaType {
    return { type: 'func' };
  }

  private compileTypeLiteralNode(node: ts.TypeLiteralNode): SchemaType {
    return {
      type: 'object',
      members: this.compileTypeElements(node.members)
    };
  }

  private compileArrayTypeNode(node: ts.ArrayTypeNode): SchemaType {
    return {
      type: 'array',
      of: this.compileType(node.elementType)
    };
  }

  private compileTupleTypeNode(node: ts.TupleTypeNode): SchemaType {
    return {
      type: 'tuple',
      of: this.compileTypes(node.elementTypes)
    };
  }

  private compileUnionTypeNode(node: ts.UnionTypeNode): SchemaType {
    return {
      type: 'union',
      of: this.compileTypes(node.types)
    };
  }

  private compileLiteralTypeNode(node: ts.LiteralTypeNode): SchemaType {
    return {
      type: 'literal',
      rawLiteral: node.getText()
    };
  }

  private compileParenthesizedTypeNode(node: ts.ParenthesizedTypeNode) {
    return this.compileType(node.type);
  }

  private compileIntersectionTypeNode(node: ts.IntersectionTypeNode): SchemaType {
    return {
      type: 'intersection',
      of: this.compileTypes(node.types)
    };
  }

  private compileOptionalType(node: ts.OptionalTypeNode) {
    const type = this.compileType(node.type);
    type.required = false;
    return type;
  }

  private compileExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments) {
    if (node.typeArguments) {
      throw new Error('compileExpression Unable to compile type arguments');
    }
    return this.compileType(node.expression);
  }

  private compileTypeOperator(node: ts.TypeOperatorNode) {
    if (node.operator === ts.SyntaxKind.ReadonlyKeyword) {
      return this.compileType(node.type);
    }
    throw new Error(`compileTypeOperator Unsupported operator: ${ts.SyntaxKind[node.operator]}`);
  }

  private compileEnumDeclaration(node: ts.EnumDeclaration) {
    if (!this.getTag(node, 'noschema')) {
      this.schema.writeEnum({
        name: this.getName(node.name),
        members: node.members.map((member) => ({
          name: member.name.getText(),
          value: getTextOfConstantValue(this.checker.getConstantValue(member))
        }))
      }, !!this.getTag(node, 'schema'));
    }
  }

  private compileInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    if (!this.getTag(node, 'noschema')) {
      if (node.typeParameters) {
        const warning = `Generics are not yet supported by ts-joi-schema-generator: ${this.getName(node.name)}<${node.typeParameters.map((type) => type.getText()).join(', ')}>`;
        if (this.getTag(node, 'schema')) {
          throw new Error(warning);
        }
        console.warn(warning);
        return;
      }

      try {
        const heritageClauses = node.heritageClauses && node.heritageClauses[0].types;
        this.schema.writeInterface({
          name: this.getName(node.name),
          heritages: this.compileTypes(heritageClauses || ts.createNodeArray()),
          members: this.compileTypeElements(node.members)
        }, !!this.getTag(node, 'schema'));
      }
      catch (err) {
        const warning = `Unable to compile interface '${this.getName(node.name)}': ${err}`;
        if (this.getTag(node, 'schema')) {
          throw new Error(warning);
        }
        console.warn(warning);
      }
    }
  }

  private compileTypeAliasDeclaration(node: ts.TypeAliasDeclaration) {
    if (!this.getTag(node, 'noschema')) {
      try {
        this.schema.writeType({
          name: this.getName(node.name),
          type: this.compileType(node.type)
        }, !!this.getTag(node, 'schema'));
      }
      catch (err) {
        const warning = `Unable to compile type alias '${this.getName(node.name)}': ${err}`;
        if (this.getTag(node, 'schema')) {
          throw new Error(warning);
        }
        console.warn(warning);
      }
    }
  }

  private compileExportDeclaration(node: ts.ExportDeclaration): void {
    if (node.exportClause) {
      // must have named exports (*'s, etc. nope)
      const namedBindings = node.exportClause;
      if (namedBindings) {
        let file: string | undefined = undefined;
        if (node.moduleSpecifier) {
          const rawModuleSpecifier = node.moduleSpecifier.getText();
          const moduleSpecifier = rawModuleSpecifier.substring(1, rawModuleSpecifier.length - 1);

          // must be a file, for now
          if (moduleSpecifier.startsWith('.')) {
            const importedSym = this.checker.getSymbolAtLocation(node.moduleSpecifier);
            if (importedSym && importedSym.declarations) {
              for (const declaration of importedSym.declarations) {
                this.compileNode(declaration);
              }
            }
          }

          file = moduleSpecifier;
        }

        this.schema.writeExport({
          file,
          namedBindings: namedBindings.elements.map<INamedBinding>((element) => {
            return {
              name: element.name.getText(),
              bound: element.propertyName ? element.propertyName.getText() : undefined
            };
          })
        });
      }
    }
  }

  private compileImportDeclaration(node: ts.ImportDeclaration): void {
    if (node.importClause) {
      const rawModuleSpecifier = node.moduleSpecifier.getText();
      const moduleSpecifier = rawModuleSpecifier.substring(1, rawModuleSpecifier.length - 1);

      // must be a file, for now
      if (moduleSpecifier.startsWith('.')) {
        // also must have named imports (default export, nope)
        const namedBindings = node.importClause.namedBindings;
        if (namedBindings && namedBindings.kind === ts.SyntaxKind.NamedImports) {
          this.schema.writeImport({
            file: moduleSpecifier,
            namedBindings: namedBindings.elements.map<INamedBinding>((element) => {
              return {
                name: element.name.getText(),
                bound: element.propertyName ? element.propertyName.getText() : undefined
              };
            })
          });

          const importedSym = this.checker.getSymbolAtLocation(node.moduleSpecifier);
          if (importedSym && importedSym.declarations) {
            for (const declaration of importedSym.declarations) {
              this.compileNode(declaration);
            }
          }
        }
      }
    }
  }

  private compileSourceFileStatements(node: ts.SourceFile) {
    for (const statement of node.statements) {
      this.compileNode(statement);
    }
  }

  private compileSourceFile(node: ts.SourceFile) {
    const file = path.resolve(node.fileName);
    const { name } = path.parse(file);

    // let's not crash on mutually importing files, try to not do that tho
    const suffix = this.options.fileSuffix || Defaults.fileSuffix;
    if (!this.schemas.has(file) && (!suffix || !name.endsWith(suffix))) {
      const schema = new SchemaBuilder(this, file, this.options);
      const context: ICompilerContext = { schema };
      this.schemas.set(file, schema);

      this.contexts.push(context);
      this.compileSourceFileStatements(node);
      this.contexts.pop();
    }
  }

  private getTag(node: ts.Node, tagName: string) {
    const tags = ts.getJSDocTags(node);
    return tags.find((tag) => tag.tagName.escapedText === tagName)
  }

  private getTags<T extends ITagsOptions>(node: ts.Node, options: T): TagsResult<T> {
    const result: TagsResult<T> = {};
    const tags = ts.getJSDocTags(node);
    for (const tag of tags) {
      const key = tag.tagName.escapedText as keyof T;
      const tagOptions = options[key];
      if (tagOptions) {
        result[key] = (
          tagOptions === 'exists' ? true :
            tagOptions === 'value' ? tag.comment && tag.comment.trim() :
              undefined
        ) as any;
      }
    }
    return result as TagsResult<T>
  }
}

function getTextOfConstantValue(value: string | number | undefined): string {
  // Typescript has methods to escape values, but doesn't seem to expose them at all. Here I am
  // casting `ts` to access this private member rather than implementing my own.
  return value === undefined ? 'undefined' : (ts as any).getTextOfConstantValue(value);
}