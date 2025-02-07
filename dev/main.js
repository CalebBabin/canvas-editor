import CanvasEditor from '../src'
import './style.css'


const canvasInstance = new CanvasEditor({});
const container = document.getElementById('container');
container.appendChild(canvasInstance.container);

canvasInstance.addWorker(new Worker(new URL('./example_worker.js', import.meta.url)));
