import { dash } from './common';
import { button, text, logger, textArea } from '@marcellejs/core';
import * as sentences from './sentences.json';
import { sentenceEncoder, huggingfaceModel } from '../../../packages/core';
import { similarity } from './helper';
import { setup } from './uploadData';

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

const textAnswer = text('');
const apikey = textArea();
apikey.title = 'API token';
const connectModel = button("load model");

let model = huggingfaceModel({API_TOKEN: `${import.meta.env.VITE_HUGGINGFACE_API}`, model: 'tuner007/pegasus_paraphrase'});
// console.log(model.$loading.ready)
connectModel.$click.subscribe(() => {
  model.setup(apikey.$value.get() === '' ? import.meta.env.VITE_HUGGINGFACE_API : apikey.$value.get());
})

const textPrompt = textArea();
const generateBtn = button("Generate Text");
generateBtn.$click.subscribe(async() => {
  const res = await model.process({inputs: textPrompt.$value.get()});
  textAnswer.$value.set(JSON.stringify(res));
})
const admitBtn = button("admit this data");
admitBtn.$click.subscribe(async() => {

})
setup(dash);
dash.page("Data Augmentation").use(apikey,connectModel, model, textPrompt);
dash.page("Data Augmentation").sidebar(generateBtn, textAnswer, admitBtn);
dash.page("sentenceEncoder").use(encoder, loadDataBtn, info, encodeBtn, results);


dash.show();
