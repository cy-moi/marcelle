import { dash } from './common';
import { button, text, logger, textArea } from '@marcellejs/core';
import * as sentences from './sentences.json';
import { sentenceEncoder, huggingfaceModel } from '../../../packages/core';
import { similarity } from './helper';
import { setupData } from './uploadData';
import { setupAugment } from './augmentation';

const encoder = sentenceEncoder();
const loadDataBtn = button('Load Data');
const info = text('');
// const result = text('')
const s = sentences.default;
loadDataBtn.$click.subscribe(() => {
  s.forEach(i => info.$value.set(info.$value.get() + i));
})

const encodeBtn = button ('Get Embeddings & Calc Similarity');
const results = text('');
results.title = "Sentences Similarity";
encodeBtn.$click.subscribe(async() => {
  const res = await encoder.process(s);
  results.$value.set(similarity(res[0], res[1]))
})


setupData(dash);
setupAugment(dash);
// dash.page("Sentence Encoder").use(encoder, loadDataBtn, info, encodeBtn, results);
dash.page("Visualize");
dash.page("Model Training");
dash.page("Testing");
dash.page("Export & Usage");

dash.show();
