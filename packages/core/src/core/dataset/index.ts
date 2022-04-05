import type { DataStore } from '../data-store';
import { Dataset } from './dataset';

export function dataset<InputType, OutputType>(
  name: string,
  store?: DataStore,
): Dataset<InputType, OutputType> {
  return new Dataset(name, store);
}

export function isDataset<T, U>(x: unknown): x is Dataset<T, U> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof x === 'object' && x !== null && (x as any).isDataset;
}

export type { Dataset };
