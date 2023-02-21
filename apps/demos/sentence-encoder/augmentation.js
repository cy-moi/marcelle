import { dash } from './common';
import { button, text, logger, textArea, textInput, Stream } from '@marcellejs/core';
import { ds, table } from './uploadData';
import { huggingfaceModel } from '../../../packages/core';

const apikey = textArea('Paste your free User Access Token for hugginface.co here');
apikey.title = '1. API token';
const connectModel = button('load model');
connectModel.title = '2. Load Paraphrase Model';

let model = huggingfaceModel({
  API_TOKEN: `${import.meta.env.VITE_HUGGINGFACE_API}`,
  model: 'tuner007/pegasus_paraphrase',
});
// console.log(model.$loading.ready)
connectModel.$click.subscribe(() => {
  model.setup(
    apikey.$value.get() === '' ? import.meta.env.VITE_HUGGINGFACE_API : apikey.$value.get(),
  );
});

const textPrompt = textArea('');
const generateBtn = button('Praphrase Text');

generateBtn.title = 'Paraphrase Selected Entries';
generateBtn.$click.subscribe(async () => {
  console.log(table.$selection.get());
  const inputs = table.$selection.get();
  const index = Math.floor(Math.random() * inputs.length);
  // const res = await model.process({inputs: textPrompt.$value.get()});
  const splited = inputs[index].text.split('.');
  const $paraphrase = Stream.now(
    splited.map(async (cur) => {
      // if(ind%2 == 0 && ind > 0)
      const res = await model.process({ inputs: cur });
      return res[0].generated_text;
    })
  );

  // $paraphrase.get().forEach((x) =>textAnswer.$value.set(r));
  $paraphrase.subscribe((x) => {
    x.map(p => p.then(t => textAnswer.$value.set(textAnswer.$value.get() + t)))
  })
});

const admitBtn = button('admit this data');
admitBtn.$click.subscribe(async () => {
  await ds.create({ text: textAnswer.$value.get(), score: scoreBoard.$value.get() });
});
const textAnswer = text('');

const scoreBoard = textInput('');
scoreBoard.title = 'Give a Score';

export function setupAugment(dash) {
  dash.page('Data Augmentation').use([apikey, connectModel], table, model);
  dash.page('Data Augmentation').sidebar(generateBtn, textAnswer, scoreBoard, admitBtn);

  dash.$page.subscribe((p) => {});
}
