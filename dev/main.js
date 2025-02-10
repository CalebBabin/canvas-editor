import Editor from '../src'
import './style.css'


const editor = new Editor({});
const container = document.getElementById('container');
container.appendChild(editor.container);

const worker = new Worker(new URL('./example_worker.js', import.meta.url), {
	type: 'module'
});
// worker.onerror = (event) => {
// 	console.error(event);
// }
editor.addWorker(worker);

editor.addItem('text', {
	text: 'Hello world!',
	width: 200,
	height: 200,
	x: 100,
	y: 100,
	rotation: 45,
});
editor.addItem('text', {
	text: 'Goodbye world...',
	width: 200,
	height: 200,
	x: -100,
	y: -100,
});