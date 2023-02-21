
import {text, textInput, button} from '@marcellejs/core';

const speech = text(`
<button>Get this output</button>
<br />
<gradio-app src="https://zerocommand-facebook-wav2vec2-large-960h-lv6-dcab218.hf.space"></gradio-app>

<iframe
	src="https://zerocommand-easyocr.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>

`);

speech.title = "Get text from audio file and add into dataset";

const result = text('');
result.title = "Recognition Result";
const scoreBoard = textInput('give score...');
scoreBoard.title = 'Score the text';
const addBtn = button('Admit');
addBtn.title = 'Admit this data';
export function setup(dash) {
    dash.page("multimedia").sidebar(result, scoreBoard, addBtn).use(speech);
} 