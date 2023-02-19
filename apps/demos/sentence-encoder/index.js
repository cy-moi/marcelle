import { dash } from './common';
import { button, text, logger, textArea } from '@marcellejs/core';
import * as sentences from './sentences.json';
import { sentenceEncoder, huggingfaceModel } from '../../../packages/core';
import { similarity } from './helper';
import { setupData } from './uploadData';
import { setupAugment } from './augmentation';
import { setup as setupCharts } from './charts';
import { setup as setupEncoder } from './preprocessing';
import { setup as setupTrain } from './training';

setupData(dash);
setupAugment(dash);
// dash.page("Sentence Encoder").use(encoder, loadDataBtn, info, encodeBtn, results);
setupEncoder(dash);
setupCharts(dash);
setupTrain(dash)
// dash.page("Model Training");
dash.page("Testing");
// dash.page("Export & Usage");

dash.show();
