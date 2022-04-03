import { ConfusionMatrix, ConfusionMatrixT } from './confusion-matrix.component';
import type { BatchPrediction } from '../batch-prediction';

export function confusionMatrix(prediction: BatchPrediction): ConfusionMatrix {
  return new ConfusionMatrix(prediction);
}

export type { ConfusionMatrix, ConfusionMatrixT };
