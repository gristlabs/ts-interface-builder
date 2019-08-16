import * as path from 'path';
import * as Defaults from './defaults';
import { SchemaProgram, ICompilerOptions } from './SchemaProgram';

export interface IContextTags {
  integer?: boolean
  min?: string
  max?: string
  regex?: string
}

export interface INamedBinding {
  bound?: string
  name: string
}

export interface IExportDeclaration {
  file?: string
  namedBindings: INamedBinding[]
}

export interface IImportDeclaration {
  file: string
  namedBindings: INamedBinding[]
}

export interface IInterfaceDeclaration {
  name: string
  heritages: SchemaType[]
  members: IMemberDeclaration[]
}

export interface ITypeDeclaration {
  name: string
  type: SchemaType
}

export interface IEnumDeclaration {
  name: string
  members: IEnumMember[]
}

export interface IEnumMember {
  name: string
  value: string
}

export interface IMemberDeclaration {
  name: string
  indexer?: Indexer
  type: SchemaType
  required: boolean
}

export type Indexer = {
  type: 'number'
} | {
  type: 'string'
  regex?: string
}

export type SchemaType = ({
  type: 'any' | 'boolean' | 'symbol' | 'undefined' | 'null' | 'never' | 'func' | 'date' | 'buffer'
} | {
  type: 'string'
  regex?: string
} | {
  type: 'number'
  integer?: boolean
  min?: string
  max?: string
} | {
  type: 'object'
  members?: IMemberDeclaration[]
} | {
  type: 'type-reference'
  name: string
} | {
  type: 'type-access'
  name: string
  access: string
} | {
  type: 'array'
  of: SchemaType
} | {
  type: 'tuple'
  of: SchemaType[]
} | {
  type: 'union'
  of: SchemaType[]
} | {
  type: 'intersection'
  of: SchemaType[]
} | {
  type: 'literal'
  rawLiteral: string
}) & {
  required?: boolean
};

export interface ISchema {
  file: string
  exports: IExportDeclaration[]
  imports: IImportDeclaration[]
  interfaces: IInterfaceDeclaration[]
  types: ITypeDeclaration[]
  enums: IEnumDeclaration[]
}

export interface IJoiRenderContext {
  addTempType(type: SchemaType | string): string
  tsignore(): void
}

export class SchemaBuilder {
  private program: SchemaProgram;
  private options: ICompilerOptions;

  private schema: ISchema;
  private referencedNames = new Set<string>();

  private finalized: boolean = false;

  constructor(program: SchemaProgram, file: string, options: ICompilerOptions) {
    this.program = program;
    this.options = options;
    this.schema = {
      file,
      enums: [],
      types: [],
      exports: [],
      imports: [],
      interfaces: []
    };
  }

  public render(): string | null {
    const result = `${this.renderImports()}${this.renderExports()}\n${this.renderEnums()}${this.renderInterfaces()}${this.renderTypes()}`.trim();
    if (result) {
      return `import * as Joi from '@hapi/joi';\n\n${result}`;
    }
    return null;
  }

  public writeImport(declaration: IImportDeclaration) {
    this.schema.imports.push(declaration);
  }

  public writeExport(declaration: IExportDeclaration) {
    this.schema.exports.push(declaration);
  }

  public writeInterface(declaration: IInterfaceDeclaration, shouldRender: boolean) {
    this.schema.interfaces.push(declaration);

    if (shouldRender) {
      this.useInterface(declaration);
    }
  }

  public writeType(declaration: ITypeDeclaration, shouldRender: boolean) {
    this.schema.types.push(declaration);

    if (shouldRender) {
      this.useType(declaration);
    }
  }

  public writeEnum(declaration: IEnumDeclaration, shouldRender: boolean) {
    this.schema.enums.push(declaration);

    if (shouldRender) {
      this.useEnum(declaration);
    }
  }

  public getUsedImports(): IImportDeclaration[] {
    return this.schema.imports
      .map((declaration) => {
        return {
          file: declaration.file,
          namedBindings: declaration.namedBindings.filter((binding) => this.referencedNames.has(binding.name))
        };
      })
      .filter((declaration) => declaration.namedBindings.length > 0);
  }

  public getUsedExports(): IExportDeclaration[] {
    return this.schema.exports
      .map((declaration) => {
        return {
          file: declaration.file,
          namedBindings: declaration.namedBindings.filter((binding) => this.referencedNames.has(binding.name))
        };
      })
      .filter((declaration) => declaration.namedBindings.length > 0);
  }

  public use(name: string) {
    const iface = this.schema.interfaces.find((declaration) => declaration.name === name);
    if (iface) {
      this.useInterface(iface);
      return;
    }

    const type = this.schema.types.find((declaration) => declaration.name === name);
    if (type) {
      this.useType(type);
      return;
    }

    const enumeration = this.schema.enums.find((declaration) => declaration.name === name);
    if (enumeration) {
      this.useEnum(enumeration);
      return;
    }

    if (this.finalized) {
      for (const declaration of this.schema.imports) {
        for (const binding of declaration.namedBindings) {
          if (name === binding.name && !this.referencedNames.has(binding.name)) {
            this.program.use(this.resolveSourceFile(declaration.file), binding.bound || binding.name);
          }
        }
      }

      for (const declaration of this.schema.exports) {
        if (declaration.file) {
          for (const binding of declaration.namedBindings) {
            if (name === binding.name && !this.referencedNames.has(binding.name)) {
              this.program.use(this.resolveSourceFile(declaration.file), binding.bound || binding.name);
            }
          }
        }
      }
    }

    this.referencedNames.add(name);
  }

  public finalize() {
    const imports = this.getUsedImports();
    for (const declaration of imports) {
      for (const binding of declaration.namedBindings) {
        this.program.use(this.resolveSourceFile(declaration.file), binding.bound || binding.name);
      }
    }

    const exports = this.getUsedExports();
    for (const declaration of exports) {
      if (declaration.file) {
        for (const binding of declaration.namedBindings) {
          this.program.use(this.resolveSourceFile(declaration.file), binding.bound || binding.name);
        }
      }
    }

    this.finalized = true;
  }

  private useInterface(declaration: IInterfaceDeclaration) {
    if (!this.referencedNames.has(declaration.name)) {
      this.referencedNames.add(declaration.name);
      for (const heritage of declaration.heritages) {
        this.reference(heritage);
      }
      for (const member of declaration.members) {
        this.reference(member.type);
      }
    }
  }

  private useType(declaration: ITypeDeclaration) {
    if (!this.referencedNames.has(declaration.name)) {
      this.referencedNames.add(declaration.name);
      this.reference(declaration.type);
    }
  }

  private useEnum(declaration: IEnumDeclaration) {
    if (!this.referencedNames.has(declaration.name)) {
      this.referencedNames.add(declaration.name);
    }
  }

  private reference(type: SchemaType) {
    switch (type.type) {
      case 'array': this.reference(type.of); break;

      case 'type-access':
      case 'type-reference': {
        if (!this.referencedNames.has(type.name)) {
          this.use(type.name);
          this.referencedNames.add(type.name);
        }
      } break;

      case 'object': {
        for (const member of type.members || []) {
          this.reference(member.type);
        }
      } break;

      case 'tuple':
      case 'union':
      case 'intersection': {
        for (const subType of type.of) {
          this.reference(subType);
        }
      } break;
    }
  }

  private renderImports() {
    const imports = this.getUsedImports();
    return imports.map((declaration) => this.renderImportExport('import', declaration)).join('');
  }

  private renderExports() {
    const exports = this.getUsedExports();
    return exports.map((declaration) => this.renderImportExport('export', declaration)).join('');
  }

  private renderImportExport(type: 'export' | 'import', declaration: IImportDeclaration | IExportDeclaration) {
    const namedBindings = declaration.namedBindings.map(binding => {
      if (binding.bound) {
        return `${this.toSchemaName(binding.bound)} as ${this.toSchemaName(binding.name)}`;
      }
      return this.toSchemaName(binding.name);
    });

    let from = '';
    if (declaration.file) {
      const filePath = declaration.file
      const { dir, name } = path.parse(filePath);
      const outPath = path.format({ dir: this.options.outDir || dir, name: `${name}${this.options.fileSuffix || Defaults.fileSuffix}` });
      from = ` from './${path.relative(this.options.outDir || './', outPath)}'`;
    }

    return `${type} { ${namedBindings.join(', ')} }${from};\n`;
  }

  private renderEnums() {
    const enums = this.schema.enums.filter((declaration) => this.referencedNames.has(declaration.name));
    return enums.map((declaration) => this.renderEnum(declaration)).join('');
  }

  private renderEnum(declaration: IEnumDeclaration) {
    const name = this.toSchemaName(declaration.name);
    const result = declaration.members.map((member) => `export const ${name}${member.name} = Joi.valid(${member.value});\n`);
    result.push(`export const ${name} = Joi.alternatives(${declaration.members.map((member) => `${name}${member.name}`).join(', ')})\n\n`);
    return result.join('');
  }

  private renderInterfaces() {
    const interfaces = this.schema.interfaces
      .filter((declaration) => this.referencedNames.has(declaration.name))
      .sort((a, b) => {
        if (a.heritages.some((decl) => decl.type === 'type-reference' && decl.name === b.name)) {
          return -1;
        }
        if (b.heritages.some((decl) => decl.type === 'type-reference' && decl.name === a.name)) {
          return 1;
        }
        return 0;
      });
    return interfaces.map((declaration) => this.renderInterface(declaration)).join('');
  }

  private renderInterface(declaration: IInterfaceDeclaration) {
    const heritage = declaration.heritages.map((heritage) => heritage.type === 'type-reference' ? `.concat(${this.toSchemaName(heritage.name)})` : '');
    const members = this.renderMembers(declaration.members, 1);
    return `export const ${this.toSchemaName(declaration.name)} = Joi.object()${heritage}${members}.strict();\n\n`
  }

  private renderTypes() {
    const types = this.schema.types.filter((declaration) => this.referencedNames.has(declaration.name));
    return types.map((declaration) => this.renderType(declaration)).join('');
  }

  private renderType(declaration: ITypeDeclaration) {
    return `export const ${this.toSchemaName(declaration.name)} = ${this.renderSchemaType(declaration.type, 1)}.strict();\n\n`
  }

  private renderSchemaType(type: SchemaType, indentation: number): string {
    let tempCount = 0;
    let tsignore = false;
    const temps: { name: string, type: string }[] = [];
    const context: IJoiRenderContext = {
      addTempType: (type) => {
        const temp = `t${++tempCount}`;
        temps.push({
          name: temp,
          type: `Joi.${typeof type === 'string' ? type : this.renderJoiRule(type, indentation + 1, context)}`
        });
        return temp;
      },
      tsignore() {
        tsignore = true;
      }
    }

    const rule = this.renderJoiRule(type, indentation, context);
    if (tempCount > 0) {
      const indent = this.indent(indentation);
      const tempsRender = temps.map((temp) => `\n${indent}const ${temp.name} = ${temp.type}.strict();`).join('');
      return `(() => {${tempsRender}\n${indent}${tsignore ? '// @ts-ignore' : ''}\n${indent}return Joi.${rule}\n${this.indent(indentation - 1)}})()`
    }

    return `Joi.${this.renderJoiRule(type, indentation, context)}`;
  }

  private renderJoiRule(type: SchemaType, indentation: number, context: IJoiRenderContext): string {
    switch (type.type) {
      case 'any': return 'any()';
      case 'func': return 'func()';
      case 'date': return 'date()';
      case 'buffer': return 'binary()';
      case 'symbol': return 'symbol()';
      case 'null': return 'valid(null)';
      case 'never': return 'forbidden()';
      case 'boolean': return 'boolean()';
      case 'undefined': return 'valid(undefined)';
      case 'literal': return `valid(${type.rawLiteral})`;
      case 'type-reference': return `lazy(() => ${this.toSchemaName(type.name)})`;
      case 'type-access': return `lazy(() => ${this.toSchemaName(type.name)}${type.access})`;
      case 'string': return `string()${type.regex ? `.regex(${type.regex})` : ''}`;
      case 'object': return `object()${this.renderMembers(type.members, indentation)}`;
      case 'array': return `array().items(${this.renderSchemaType(type.of, indentation)})`;
      case 'union': return `alternatives(\n${type.of.map((t) => this.indent(indentation) + this.renderSchemaType(t, indentation)).join(',\n')}\n${this.indent(indentation - 1)})`;
      case 'tuple': return `array().ordered(\n${type.of.map((t) => this.indent(indentation) + this.renderSchemaType(t, indentation)).join(',\n')}\n${this.indent(indentation - 1)})`;
      case 'number': return `number()${type.integer ? '.integer()' : ''}${type.min !== undefined ? `.min(${type.min})` : ''}${type.max !== undefined ? `.max(${type.max})` : ''}`;
      case 'intersection': return this.renderIntersection(type.of, indentation, context);
    }
  }

  private renderIntersection(of: SchemaType[], indentation: number, context: IJoiRenderContext) {
    const objects = of.filter((type) => type.type === 'object');
    const unions = of.filter((type) => type.type === 'union');
    if ((objects.length + unions.length) < of.length) {
      throw new Error(`Invalid intersection`);
    }

    if (unions.length > 1) {
      indentation += 1;
    }

    const baseConcats = objects.map((type) => `\n${this.indent(indentation)}.concat(${this.renderSchemaType(type, indentation)})`);
    const baseObject = `object()${baseConcats.join('')}`;

    if (unions.length === 0) {
      return baseObject;
    }

    const indent = this.indent(indentation + 1);
    const baseJoi = context.addTempType(baseObject);
    const unionsJoi = unions.map((union) => context.addTempType(union));
    const declarations = `\n${indent}const options = { ...helpers.prefs, allowUnknown: true };\n${indent}let result;`;

    const checks = [baseJoi, ...unionsJoi].map((temp) => {
      return `\n${indent}result = ${temp}.validate(value, options);\n${indent}if (result.error) throw result.error;`;
    }).join('')

    context.tsignore();
    return `custom((value, helpers) => {${declarations}${checks}\n${indent}return value;\n${this.indent(indentation)}})`
  }

  private renderMembers(members: IMemberDeclaration[] | undefined, indentation: number) {
    if (members) {
      const indexer = members.find((member) => member.indexer);
      const properties = members.map((member) => this.renderMember(member, indentation)).join('');
      return `.keys({\n${properties}${this.indent(indentation - 1)}})${this.renderIndexer(indexer, indentation)}`;
    }
    return '';
  }

  private renderMember(member: IMemberDeclaration, indentation: number) {
    const indent = this.indent(indentation);
    if (member.indexer) {
      return ''
    }
    const type = this.renderSchemaType(member.type, indentation + 1);
    const required = member.required ? '.required()' : '';
    return `${indent}${member.name}: ${type}${required},\n`
  }

  private renderIndexer(member: IMemberDeclaration | undefined, indentation: number): string {
    if (member && member.indexer) {
      const pattern = this.renderIndexerPattern(member.indexer);
      return `.pattern(${pattern}, ${this.renderSchemaType(member.type, indentation)})`;
    }
    return '';
  }

  private renderIndexerPattern(indexer: Indexer) {
    switch (indexer.type) {
      case 'number': return '/^\d+(.\d+)?$/';
      case 'string': {
        if (indexer.regex) {
          return indexer.regex;
        }
        return '/^.*$/';
      }
    }
  }

  private toSchemaName(name: string) {
    return `${name}${this.options.schemaSuffix === undefined ? Defaults.schemaSuffix : this.options.schemaSuffix}`;
  }

  private indent(indentation: number) {
    return ''.padEnd(indentation * 2, ' ');
  }

  public resolveSourceFile(file: string) {
    const dir = path.dirname(this.schema.file);
    return path.join(dir, file);
  }
}