import { genericChart, LazyIterable } from '@marcellejs/core';
import { ds, table, columns } from './uploadData';
// import './testing';
// import './batch-prediction';

// const keys = ['petal.length', 'petal.width', 'sepal.length', 'sepal.width'];

const charts = columns.map((key) => {
  const chart = genericChart({
    preset: 'bar',
    options: { xlabel: 'variety', ylabel: key },
  });
  chart.title = key;
  return chart;
});

async function createChart(key, chart) {
  const labels = await ds.distinct('score');
  const it = new LazyIterable(async function* () {
    for (const label of labels) {
      const things = await ds
        .items()
        .filter(({ variety }) => variety === label)
        .map((instance) => instance[key])
        .toArray();
      const avg = things.reduce((x, y) => x + y) / things.length;
      yield { x: label, y: avg };
    }
  });
  chart.addSeries(it);
}

ds.ready.then(() => {
  for (const [i, key] of keys.entries()) {
    createChart(key, charts[i]);
  }
});

export function setup(dash) {
  dash.page('Charts', false).use(charts);
}
