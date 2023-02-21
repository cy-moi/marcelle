// import {errorMonitor} from 'events';
import { ds, table } from './uploadData';
import { textArea, textInput, button, throwError } from '@marcellejs/core';

const changeSelected = button('Make Changes');
changeSelected.title = 'Change Selected Data Entry';
const saveChange = button('Save Changes');
saveChange.title = 'Write Back to Dataset';

const textValue = textArea('');
const scoreValue = textInput('');

changeSelected.$click.subscribe(() => {
  const selected = table.$selection.get();
  textValue.$value.set(selected[0].text);
  scoreValue.$value.set(selected[0].score);
  console.log(selected);
});

saveChange.$click.subscribe(() => {
  const selected = table.$selection.get();
  console.log(selected);

  if (selected.length > 0) {
    ds.patch(selected[0].id, { text: textValue.$value.get(), score: scoreValue.$value.get() });
  } else ds.create({ text: textValue.$value.get(), score: scoreValue.$value.get() });
});

export function setup(dash) {
  dash.page('Clean Data').sidebar(changeSelected, textValue, scoreValue, saveChange).use(table);
}
