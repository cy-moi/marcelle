import { genericChart, LazyIterable } from '@marcellejs/core';
import { ds, table, columns } from './uploadData';
// import './testing';
// import './batch-prediction';

// const keys = ['petal.length', 'petal.width', 'sepal.length', 'sepal.width'];

const chart1 = genericChart({
    preset: 'bar',
    options: { xlabel: 'score', ylabel: 'num of texts' },
  });
chart1.title = "overview";


async function createChart(key, chart) {
  // console.log();
  const labels = await ds.distinct('score');
  // console.log(labels)
  const it = new LazyIterable(async function* () {
    for (const label of labels) {
      // console.log(label)
      const things = await ds
        .items()
        .filter(({ score }) => score === label)
        .map((instance) => instance[key])
        .toArray();
      // console.log(things)
      const avg = things.length;
      yield { x: label, y: avg };
    }
  });
  // console.log(it)
  chart.addSeries(it);
}

const chart2 = genericChart({
  preset: 'bar',
  options: { xlabel: 'text length', ylabel: 'num of texts' },
});
chart2.title = "text length";


async function createLengthChart(key, chart) {
  // console.log();
  const labels = await ds.items().reduce((obj, instance) => {
    const num = instance.text.split('.').length;
    if(obj[`${num}`]) obj[`${num}`] += 1;
    else obj[`${num}`] = 1;
    return obj;
  }, {});
  console.log(labels)

  // const it = Object.keys(labels).reduce((res, key) => {
  //   res.push({x: key, y: labels[key]});
  //   return res;
  // }, [])
  const it = new LazyIterable(function* () {
    for (const label of Object.keys(labels)) {
      
      yield { x: label, y: labels[label] };
    }
  });
  chart.addSeries(it);
}

const chart3 = genericChart({
  preset: 'scatter',
  options: { xlabel: 'text length', ylabel: 'log feature' },
});

function createScatter(){
  ds.ready
  .then(() => ds.distinct('score'))
  .then((labels) => {
    for (const label of labels) {
      chart3.addSeries(
        ds
          .items()
          .filter(({ score }) => score === label)
          .map((instance) => ({ x: instance['length'], y: instance['log'] })),
        label,
      );
    }
  });
}

export async function setup(dash) {
  ds.ready.then(() => createChart(`score`, chart1));
  ds.ready.then(() => createLengthChart(`length`, chart2));
  createScatter();

  dash.page('Charts', false).use([chart1, chart2], chart3);
}
