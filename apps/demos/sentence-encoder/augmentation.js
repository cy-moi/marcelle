import { dash } from './common';
import { button, text, logger, textArea, textInput } from '@marcellejs/core';
import { ds, table } from './uploadData';
import { huggingfaceModel } from '../../../packages/core';

const apikey = textArea('Paste your free User Access Token for hugginface.co here');
apikey.title = '1. API token';
const connectModel = button("load model");
connectModel.title = '2. Load Paraphrase Model'

let model = huggingfaceModel({API_TOKEN: `${import.meta.env.VITE_HUGGINGFACE_API}`, model: 'tuner007/pegasus_paraphrase'});
// console.log(model.$loading.ready)
connectModel.$click.subscribe(() => {
  model.setup(apikey.$value.get() === '' ? import.meta.env.VITE_HUGGINGFACE_API : apikey.$value.get());
})

const textPrompt = textArea('');
const generateBtn = button("Generate Text");

generateBtn.title = 'pegasus paraphrase model'
generateBtn.$click.subscribe(async() => {
  const res = await model.process({inputs: textPrompt.$value.get()});
  textAnswer.$value.set(JSON.stringify(res));
})
const admitBtn = button("admit this data");
admitBtn.$click.subscribe(async() => {

})
const textAnswer = text('');

const scoreBoard = textInput('');
scoreBoard.title = 'Give a Score';

export function setupAugment(dash) {
  dash.page("Data Augmentation").use([apikey,connectModel], table,model);
  dash.page("Data Augmentation").sidebar(generateBtn, textAnswer, scoreBoard, admitBtn);

  dash.$page.subscribe((p) => {

  });
}
