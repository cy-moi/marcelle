import '@marcellejs/core/dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  modelParameters,
  confidencePlot,
  trainingProgress,
  sketchPad,
  textInput,
  toggle,
  trainingPlot,
  throwError,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = sketchPad();
const featureExtractor = mobileNet();

const label = textInput();
label.title = 'Instance label';
const capture = button('Capture this drawing');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-sketch', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

capture.$click
  .sample(input.$images)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: label.$value.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');

const classifier = mlpClassifier({
  layers: [64, 32],
  epochs: 20,
  dataStore: store,
});
classifier.sync('sketch-classifier');

b.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const confMat = confusionMatrix(batchMLP);

const predictButton = button('Update predictions');
predictButton.$click.subscribe(async () => {
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle('toggle prediction');
tog.$checked.subscribe((checked) => {
  if (checked && !classifier.ready) {
    throwError(new Error('No classifier has been trained'));
    setTimeout(() => {
      tog.$checked.set(false);
    }, 500);
  }
});

const $predictions = input.$images
  .filter(() => tog.$checked.value && classifier.ready)
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

const plotResults = confidencePlot($predictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Sketch (Offline)',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').sidebar(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

dash.show();
