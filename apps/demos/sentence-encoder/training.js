import {
  button,
  mlpClassifier,
  modelParameters,
  trainingPlot,
  trainingProgress,
} from '@marcellejs/core';
import { store } from './common';
import { ds } from './uploadData';

export function processDataset() {
  // x : embeddings
  return ds.items().map((instance) => ({
    x: [
        instance['log'],
        instance['length']
      ],
    y: instance.score,
  }));
}


export const classifier = mlpClassifier().sync(store, 'texts');
const params = modelParameters(classifier);

const trainBtn = button('Train the classifier');
trainBtn.$click.subscribe(() => {
  const ds = processDataset();
  classifier.train(ds);
});

const prog = trainingProgress(classifier);
const graphs = trainingPlot(classifier);

export function setup(dash) {
  dash.page('Training').sidebar(params).use(trainBtn, prog, graphs);
  dash.settings.models(classifier);
}
