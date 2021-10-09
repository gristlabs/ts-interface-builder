export interface SquareConfig {
  color: string;
  width?: number;
  [propName: string]: any;
}

export interface IndexSignatures {
  data: {[index: number]: number[]};
}

export type CellValue = number|string|boolean|null|[string, ...unknown[]];

export interface RowRecord {
  id: number;
  [colId: string]: CellValue;
}
