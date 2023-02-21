import {
  button,
  mlpClassifier,
  mlpRegressor,
  pca,
  modelParameters,
  trainingPlot,
  trainingProgress,
} from '@marcellejs/core';
import { store } from './common';
import { ds } from './uploadData';
import { training } from './preprocessing';

export function processDataset() {
  // x : embeddings
  return training.items().map((instance) => ({
    x: instance['embeddings'].reduce((flat, em) => flat = [...flat, ...em],[]),
    y: parseFloat(instance.score.split('_')[0]),
  }));
}

// export const classifier = mlpRegressor().sync(store, 'texts');
export const classifier = mlpRegressor({units: [64, 32], epochs: 50});

const trainBtn = button('Train the regressor');
trainBtn.$click.subscribe(() => {
  // classifier.clear();

  const ds = processDataset();
  classifier.train(ds);
});

const prog = trainingProgress(classifier);
const graphs = trainingPlot(classifier);

export function setup(dash) {
  dash.page('Training').sidebar().use(trainBtn, prog, graphs);
  dash.settings.models(classifier);
}
