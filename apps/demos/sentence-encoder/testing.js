import { classifier } from './training';
import { training, testing } from './preprocessing';
import { store } from './common';
import { batchPrediction, confusionMatrix, button, text, throwError } from '@marcellejs/core';
import { table } from './uploadData';

let results = text(`Just some HTML text content...<br>
Accepts HTML: <a href="https://marcelle.dev">Click me!</a>`);

const startTest = button('start testing');

startTest.$click.subscribe(async () => {
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  console.log(classifier.ready);
  // const res = await classifier.predict([0.1, 1]);
  // console.log(res)
  const res = await testing.items().reduce(async (res, s) => {
    const t = await res;
    const r = await classifier.predict([s.log, s.length]);
    const { label, confidences } = r;
    t.push({ prediction: label, confidences, truth: s.score });
    // console.log(r);

    return t;
  }, Promise.resolve([]));

  results.$value.set(JSON.stringify(res));
});

export function setup(dash) {
  testing.ready.then(() => {
    // results.mount(`<div></div>`)
    console.log(classifier.ready);
    // results.$value.set(startTest);
  });

  dash.page('Testing').use(startTest, results);
}
