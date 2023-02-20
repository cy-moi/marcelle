import { dash } from './common';
import {
  button,
  select,
  dataset,
  datasetTable,
  datasetScatter,
  text,
  logger,
  textArea,
} from '@marcellejs/core';
import * as sentences from './sentences.json';
import { store } from './common';
import { sentenceEncoder, huggingfaceModel } from '@marcellejs/core';
import { similarity } from './helper';
import { ds } from './uploadData';
import { magnitude } from './helper';

const columns = ['score', 'embeddings', 'magnitude', 'log', 'length', 'text'];

export const embeddings = dataset('embeddings', store);
const embeddingTable = datasetTable(ds, columns);
// const scatterpt = datasetScatter(ds);
const origin = Array.from({ length: 5 }, (v) => 0);

const encoder = sentenceEncoder();
// const loadDataBtn = button('Load Data');
const info = text('');
// const result = text('')
const s = sentences.default;
// loadDataBtn.$click.subscribe(() => {
//   s.forEach(i => info.$value.set(info.$value.get() + i));
// })

const encodeBtn = button('Get Embeddings');
const magniBtn = button('Get Magnitudes');
const padding = button('Padding Data');
const splitRate = select(["40%","50%", "60%"]);
splitRate.title = "Split Data For Training";
const split = button('Split');

export const training = dataset('training', store);
const trainTable = datasetTable(training, columns);
export const testing = dataset('testing', store);
const testTable = datasetTable(testing, columns);

encodeBtn.$click.subscribe(async () => {
  ds.items().forEach(async (instance, index) => {
    const { id, text, score } = instance;
    const sentences = text.split('.');
    const eb = await sentences.reduce(async (res, s) => {
        const t = await res;
        const r = await encoder.process(s);
        t.push(...r);
        console.log(t);

        return t;
      }, Promise.resolve([]))


    ds.update(id, {
      ...instance,
      embeddings: eb,
    });

  });
});

magniBtn.$click.subscribe(() => {
  ds.items().forEach((instance) => {
    const { id, embeddings,text } = instance;
    const mags = embeddings.reduce((res, e) => {
      // console.log(res)
      res.push(magnitude(e));
      return res;
    }, [])
    const logs = mags.map(m => Math.log(m))
    const MAGIC = 10000000;
    // console.log(logs.reduce((sum, cur) => sum += cur, 0)/logs.length * MAGIC)
    ds.update(id, {
      ...instance,
      magnitude: mags,
      log: logs.reduce((sum, cur) => sum += cur, 0)/logs.length * MAGIC,
      length: text.split('.').length
    });
  });
});

padding.$click.subscribe(() => {

})

split.$click.subscribe(() => {
  const scheme = splitRate.$value.get();
  const rate = {
    '40%': 0.4,
    '50%':0.5,
    '60%':0.6
  }
  ds.items().forEach(async(instance) => {
    const {score, embeddings, magnitude, log, length, text} = instance;
    if(Math.random() <= rate[scheme]) await training.create({score, embeddings, magnitude, log, length, text});
    else await testing.create({score, embeddings, magnitude, log, length, text});
  })
})

export const setup = (dash) => {
  dash.page('preprocess').sidebar(encodeBtn, magniBtn, splitRate, split).use(embeddingTable, [trainTable, testTable]);
};
