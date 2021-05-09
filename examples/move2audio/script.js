import '../../dist/marcelle.css';
import { Howl } from 'https://cdn.skypack.dev/howler';
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
  text,
  textField,
  toggle,
  trainingPlot,
  webcam,
  wizard,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const labelInput = textField();
labelInput.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-move2audio', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: labelInput.$text.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20, dataStore: store });
classifier.sync('move2audio-classifier');
b.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const confMat = confusionMatrix(batchMLP);

const predictButton = button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const $predictions = input.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

const plotResults = confidencePlot($predictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Wizard',
  author: 'Marcelle Pirates Crew',
  closable: true,
});

dash
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([labelInput, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const wizardButton = button({ text: 'Record Examples (class a)' });
const wizardText = text({ text: 'Waiting for examples...' });
wizardButton.$down.subscribe((x) => {
  capture.$down.set(x);
});

let countPerClass = { A: 0, B: 0, C: 0 };
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      countPerClass[data.y] += 1;
    } else if (level === 'instance' && type === 'removed') {
      countPerClass[data.y] -= 1;
    } else {
      const allInstances = await trainingSet.items().select(['y']).toArray();
      for (const l of ['A', 'B', 'C']) {
        countPerClass[l] = allInstances.filter(({ y }) => y === l).length;
      }
    }
  }
  const label = labelInput.$text.value;
  const numExamples = countPerClass[label] || 0;
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

const wiz = wizard();

wiz
  .step()
  .title('Record examples for class A')
  .description('Hold on the record button to capture training examples for class A')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Record examples for class B')
  .description('Hold on the record button to capture training examples for class B')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Record examples for class C')
  .description('Hold on the record button to capture training examples for class C')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Train the model')
  .description('Now that we have collected images, we can train the model from these examples.')
  .use(b, prog)
  .step()
  .title('Test the classifier')
  .description('Reproduce your gestures to test if the classifier works as expected')
  .use([input, plotResults]);

labelInput.$text.subscribe((label) => {
  wizardButton.$text.set(`Record Examples (class ${label})`);
  const numExamples = countPerClass[label] || 0;
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

wiz.$current.subscribe((stepIndex) => {
  if (stepIndex === 0) {
    labelInput.$text.set('A');
  } else if (stepIndex === 1) {
    labelInput.$text.set('B');
  } else if (stepIndex === 2) {
    labelInput.$text.set('C');
  }
  if (stepIndex === 4) {
    tog.$checked.set(true);
  } else {
    tog.$checked.set(false);
  }
});

// -----------------------------------------------------------
// MAIN APP
// -----------------------------------------------------------

// Setup the webcam
input.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

setTimeout(() => {
  input.$active.set(true);
}, 200);

// Load audio files
let numLoaded = 0;
const sounds = [
  'Trap Percussion FX Loop.mp3',
  'Trap Loop Minimal 2.mp3',
  'Trap Melody Full.mp3',
].map((x) => new Howl({ src: [x], loop: true, volume: 0 }));
const onload = () => {
  numLoaded += 1;
  if (numLoaded === 3) {
    for (const x of sounds) {
      x.play();
    }
  }
};
for (const s of sounds) {
  s.once('load', onload);
}

// Update the GIFs with real-time recognition
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

let PrevLabel = '';
$predictions.subscribe(async ({ label, confidences }) => {
  if (label !== PrevLabel) {
    d.innerText = `predicted label: ${label}`;
    if (label === 'A') {
      resultImg.src = 'https://media.giphy.com/media/M9gPbRZTWqZP2/giphy.gif';
    } else if (label === 'B') {
      resultImg.src = 'https://media.giphy.com/media/i6JLRbk4f2gIU/giphy.gif';
    } else {
      resultImg.src = 'https://media.giphy.com/media/hWpgTWoWkqi2NmFeks/giphy.gif';
    }
    PrevLabel = label;
  }
  for (const [i, x] of ['A', 'B', 'C'].entries()) {
    sounds[i].volume(confidences[x] || 0);
  }
});

document.querySelector('#open-wizard').addEventListener('click', () => {
  wiz.start();
});
document.querySelector('#open-dashboard').addEventListener('click', () => {
  dash.start();
});
