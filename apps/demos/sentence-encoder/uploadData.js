import { button, dataset, datasetTable, text, fileUpload, textArea } from '@marcellejs/core';
// import readJson
import { parse } from 'https://cdn.skypack.dev/papaparse';

import { store } from './common';
import { dash } from './common';

let columns = ['text', 'score'];
const allfiles = []; 
const ds = dataset('texts', store);
const table = datasetTable(ds, columns);

const myFileUpload = fileUpload();
myFileUpload.title = '1. Upload data file';
myFileUpload.$files.subscribe(async (x) => {
  console.log('fileUpload $files:', x);
  // myFileUpload.title = `1. Upload data file: ${x.length} uploaded`
});

async function readCSVResult(results) {
  const { data, errors } = results;
  new Promise((resolve) => {
    if (errors.length > 0) {
      for (const err of errors) {
        if (err.code === 'TooFewFields') {
          data.splice(err.row, 1);
        }
      }
    }
    // console.log(data);
    resolve(data);
  });
}

async function loadData(ds, rawCsv) {
  // await ds.clear();

  parse(rawCsv, {
    complete: async (results) => {
      const { data, errors } = results;

      for (const instance of data) {

        const d = instance.reduce((obj, cur, ind) => {
          if (columns[ind]) obj = { ...obj, [columns[ind]]: cur };
          return obj;
        }, {});

        await ds.create(d);
      }
    },
  });

  // await ds.create({text: 'alsdfkjalsdkfjalk'});
}

const loadDataBtn = button('Load Data');
loadDataBtn.title = '2. Load data from uploaded files';
loadDataBtn.$click.subscribe(() => {
  myFileUpload.$files.get().forEach((file) => {
    loadData(ds, file);
  });
});

const info = text('The dataset is empty');
info.title = 'Uploaded Files';
myFileUpload.$files.subscribe(async (x) => {
  // console.log(x.reduce((str, cur) => {return str += cur.name + ' '}, ''))
  for(let file of x) {
    allfiles.push(file);
  }
  info.$value.set(`${allfiles.reduce((str, cur) => {return str += cur.name + ' \n'}, '')}`)
});

const textBoard = textArea('add more text here...');
textBoard.title = '3. Manually add data';
const scoreBoard = textArea('give score...');
scoreBoard.title = '4. Score the text';
const addBtn = button('Admit');
addBtn.title = '5. Admit this data';
addBtn.$click.subscribe(async() => {
  console.log(scoreBoard.$value.get())
  await ds.create({text: textBoard.$value.get(), score: `${scoreBoard.$value.get()}`});
})


export function setup(dash) {
  dash.page('Load Data').sidebar(myFileUpload, loadDataBtn, info).use(table);
  dash.page('Manually Add Data').sidebar(textBoard, scoreBoard, addBtn).use(table);

  dash.$page.subscribe((p) => {
    // trainingSetTable.singleSelection = p.includes('testing');
    // testSetTable.singleSelection = p.includes('testing');
  });
}
