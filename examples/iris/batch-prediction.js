import { batchPrediction, button, confusionMatrix } from '../../dist/marcelle.esm';
import { processDataset } from './preprocessing';
import { classifier } from './training';
import './testing';

const bp = batchPrediction({ name: 'iris-predictions' });
const batchButton = button('Update Predictions');
batchButton.title = 'Batch prediction';
batchButton.$click.subscribe(() => {
  bp.predict(classifier, processDataset());
});
const conf = confusionMatrix(bp);

export function setup(dash) {
  dash.page('Batch prediction').use(batchButton, conf);
}
