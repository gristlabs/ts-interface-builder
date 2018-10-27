interface ICacheItem {
  key: string;
  value: any;
  size: number;
  tag?: string;
}

interface ILRUCache {
  capacity: number;
  set(item: ICacheItem, overwrite?: boolean): boolean;
  get(key: string): ICacheItem;
}

type MyType = boolean | number | ILRUCache;

export type NumberAlias = number;
export type NumberAlias2 = NumberAlias;

export function foo() {
  process.stdout.write("bar\n");
}

// A few enum kinds.
export enum SomeEnum { Foo, Bar }
export enum Direction { Up = 1, Down, Left = 17, Right }
export enum DirectionStr {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}
export enum BooleanLikeHeterogeneousEnum { No = 0, Yes = "YES" }
export enum EnumComputed { Foo, Bar = Direction.Left, Baz = Bar - 1 }
export enum AnimalFlags {
    None           = 0,
    HasClaws       = 1 << 0,
    CanFly         = 1 << 1,
    EatsFish       = 1 << 2,
    Endangered     = 1 << 3
}

// random comment.
export interface ISampling extends ICacheItem {
  xstring: string;
  "xstring2": string;
  xany: any;
  xnumber: number;
  xnumber2?: number;
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
  xliteral: "foo" | "ba\"r" | 3;
  xfunc: (price: number, quantity: number) => number;
  xfunc2(price: number, quantity?: number): number;
  xDirection: Direction;
  xDirectionStr: DirectionStr;
  // Ensure we support enum constants, often used for discriminated unions.
  xDirUp: Direction.Up | Direction.Left;
  xDirStrLeft: DirectionStr.Left;

  // Ensure that omitted type parameters are seen as "any", without causing errors.
  ximplicit;
  ximplicitFunc: (price) => number;
  ximplicitFunc2(price);
}
