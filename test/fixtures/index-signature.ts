export interface SquareConfig {
  color: string;
  width?: number;
  [propName: string]: any;
}

export interface IndexSignatures {
  data: {[index: number]: number[]};
}
