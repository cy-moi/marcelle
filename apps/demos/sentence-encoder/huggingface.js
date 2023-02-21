import { text, textArea, textInput, button } from '@marcellejs/core';
import { ds, table } from './uploadData';

const speech = text(`
<div>To use the recognition results: <br />Please paste your recognition result to the left and add to the dataset.</div>
<gradio-app src="https://zerocommand-facebook-wav2vec2-large-960h-lv6-dcab218.hf.space"></gradio-app>

`);

const ocr = text(`
<div>To use the recognition results: <br />Please paste your recognition result to the left and add to the dataset.</div>


<iframe
	src="https://zerocommand-easyocr.hf.space"
	frameborder="0"
	width="500"
	height="450"
></iframe>
`)

speech.title = 'Get text from an audio file';
ocr.title = 'Get text from an image file'

const textBoard = textArea('');
textBoard.title = 'Recognition Result';
const scoreBoard = textInput('give score...');
scoreBoard.title = 'Score the text';
const addBtn = button('Add to Dataset');
addBtn.title = 'Add this data';
addBtn.$click.subscribe(async() => {
  console.log(scoreBoard.$value.get())
  await ds.create({text: textBoard.$value.get(), score: `${scoreBoard.$value.get()}`});
})

export function setup(dash) {
  dash.page('Upload From Multimedia').sidebar(textBoard, scoreBoard, addBtn, table).use([speech, ocr]);
}
