import { TypeA } from './imports-child-a';
import { TypeB, TypeC, TypeD } from './imports-child-b';

export interface TypeAll {
  a: TypeA,
  b: TypeB,
  c: TypeC,
  d: TypeD
}