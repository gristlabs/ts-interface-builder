export interface IMyArrayContainer {
  myArray: Array<number>;
  myArray2: Array<{foo: string, bar: number}>;
  myArray3: number[];
  myArray4: [number];
  myArray5: [number, number];
  myArray6: [number, number | undefined];
  myArray7: [number, number?];
}
