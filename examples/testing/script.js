import '../../dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  imageUpload,
  mobileNet,
  confidencePlot,
  text,
  toggle,
  imageDisplay,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageUpload();
const classifier = mobileNet();

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = source.$thumbnails.map((thumbnail) => ({
  type: 'image',
  data: source.$images.value,
  label: 'unlabeled',
  thumbnail,
}));

const store = dataStore('memory');
const trainingSet = dataset('TrainingSet', store);

const tog = toggle('Capture to dataset');
tog.$checked.skipRepeats().subscribe((x) => {
  if (x) {
    trainingSet.capture(instances);
  } else {
    trainingSet.capture(null);
  }
});

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchTesting = batchPrediction({ name: 'mobileNet', dataStore: store });
const predictButton = button('Update predictions');
const predictionAccuracy = text('Waiting for predictions...');
const confMat = confusionMatrix(batchTesting);
confMat.title = 'Mobilenet: Confusion Matrix';

predictButton.$click.subscribe(async () => {
  await batchTesting.clear();
  await batchTesting.predict(classifier, trainingSet, 'data');
});

batchTesting.$predictions.subscribe(async () => {
  if (!batchTesting.predictionService) return;
  const { data } = await batchTesting.predictionService.find();
  const accuracy =
    data.map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0)).reduce((x, y) => x + y, 0) /
    data.length;
  predictionAccuracy.$value.set(`Global Accuracy (Mobilenet): ${accuracy}`);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();
const plotResults = confidencePlot(predictionStream);

const instanceViewer = imageDisplay(source.$images);

const buttonCorrect = button('Yes! 😛');
buttonCorrect.title = '';
const buttonIncorrect = button('No... 🤔');
buttonIncorrect.title = '';

let numCorrect = 0;
let numIncorrect = 0;
const quality = text('Waiting for predictions...');
function updateQuality() {
  const percent = (100 * numCorrect) / (numCorrect + numIncorrect);
  quality.$value.set(
    `You evaluated ${percent.toFixed(0)}% of tested images as correct. ${
      percent > 50 ? '😛' : '🤔'
    }`,
  );
}
buttonCorrect.$click.subscribe(() => {
  numCorrect += 1;
  updateQuality();
});
buttonIncorrect.$click.subscribe(() => {
  numIncorrect += 1;
  updateQuality();
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
});

const help = text(
  'In this example, you can test an existing trained model (mobileNet), by uploading your own images to assess the quality of the predictions.',
);
help.title = 'Test Mobilenet with your images!';

dash
  .page('Real-time Testing')
  .sidebar(source, classifier)
  .use(
    help,
    [instanceViewer, plotResults],
    'Is this prediction Correct?',
    [buttonCorrect, buttonIncorrect],
    quality,
  );
dash
  .page('Batch Testing')
  .sidebar(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confMat);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

dash.show();
