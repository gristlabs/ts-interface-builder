/** @schema */
interface ICacheItem {
  /** @regex /^key-\d+$/ */
  key: string|null;
  value: any;
  size: number;
  tag?: string;
}

/** @schema */
interface ILRUCache {
  /** @integer */
  capacity: number;
  set(item: ICacheItem, overwrite?: boolean): boolean;
  get(key: string): ICacheItem;
}

/** @schema */
type MyType = boolean | number | ILRUCache;

/** @schema */
export type NumberAlias = number;

/** @schema */
export type NumberAlias2 = NumberAlias;

export function foo() {
  process.stdout.write('bar\n');
}

// A few enum kinds.
/** @schema */
export enum SomeEnum { Foo, Bar }

/** @schema */
export enum Direction { Up = 1, Down, Left = 17, Right }

/** @schema */
export enum DirectionStr {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT',
}

/** @schema */
export enum BooleanLikeHeterogeneousEnum { No = 0, Yes = 'YES' }

/** @schema */
export enum EnumComputed { Foo, Bar = Direction.Left, Baz = Bar - 1 }

/** @schema */
export enum AnimalFlags {
    None           = 0,
    HasClaws       = 1 << 0,
    CanFly         = 1 << 1,
    EatsFish       = 1 << 2,
    Endangered     = 1 << 3
}

// random comment.
/** @schema */
export interface ISampling extends ICacheItem {
  xstring: string;
  'xstring2': string;
  xany: any;
  xnumber: number;
  xnumber2?: number;
  /** @min 0 */
  /** @max 2 */
  /** @integer */
  xnumber3: number;
  /** @max 10 */
  xnumber4: number;
  xNumberAlias: NumberAlias;
  xNumberAlias2: NumberAlias2;
  xnull: null;
  /* more random comments */
  xMyType: MyType;
  xarray: string[];
  xarray2: MyType[];
  xtuple: [string, number];
  xunion: number | null;
  xparen: (number|string);    // parenthesized type
  xiface: { foo: string; bar: number };
  xliteral: 'foo' | 'ba\'r' | 3;
  xfunc: (price: number, quantity: number) => number;
  xfunc2(price: number, quantity?: number): number;
  xDirection: Direction;
  xDirectionStr: DirectionStr;
  // Ensure we support enum constants, often used for discriminated unions.
  xDirUp: Direction.Up | Direction.Left;
  xDirStrLeft: DirectionStr.Left;

  // Ensure that omitted type parameters are seen as 'any', without causing errors.
  // @ts-ignore
  ximplicit;
  // @ts-ignore
  ximplicitFunc: (price) => number;
  // @ts-ignore
  ximplicitFunc2(price);
}
