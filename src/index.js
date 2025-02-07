/**
 * @typedef {Object} CanvasEditorConfig
 * @property {boolean} editable - can the user interact with the canvas?
 */

const defaultConfig = {
	editable: true,
}

import { css } from '@emotion/css';
const container_styles = css`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
`;

const contents_styles = css`
	width: 0;
	height: 0;
	position: absolute;
	top: 50%;
	left: 50%;
	overflow: visible;

	border: 10px solid red;
`;

export default class CanvasEditor {

	/**
	 * @type {CanvasEditorConfig}
	 */
	config = { ...defaultConfig };

	/** @private the x coordinate of the canvas viewport */
	#x = 0;
	/** @private the y coordinate of the canvas viewport */
	#y = 0;
	/** @private the scale of the canvas viewport */
	#scale = 1;

	/**
	 * Sets the x coordinate of the canvas viewport
	 * @param {number} value - The x coordinate to set
	 */
	set x(value) {
		this.#x = value;
		this.#updateContentTransform();
	}
	/**
	 * The current x coordinate of the canvas viewport
	 * @returns {number} The current x coordinate
	 */
	get x() {
		return this.#x;
	}
	/**
	 * Sets the y coordinate of the canvas viewport
	 * @param {number} value - The y coordinate to set
	 */
	set y(value) {
		this.#y = value;
		this.#updateContentTransform();
	}
	/**
	 * The current y coordinate of the canvas viewport
	 * @returns {number} The current y coordinate
	 */
	get y() {
		return this.#y;
	}

	/**
	 * Sets the scale of the canvas viewport
	 * @param {number} value - The scale to set
	 */
	set scale(value) {
		this.#scale = value;
		this.#updateContentTransform();
	}
	/**
	 * The current scale of the canvas viewport
	 * @returns {number} The current scale
	 */
	get scale() {
		return this.#scale;
	}

	/** Current mouse x position relative to the canvas viewport */
	mouseX = 0;
	/** Current mouse y position relative to the canvas viewport */
	mouseY = 0;

	/**
	 * The container for the editor
	 */
	container = document.createElement('div');

	/**
	 * The container for the contents of the editor
	 */
	contents = document.createElement('div');

	/**
	 * 
	 * @param {CanvasEditorConfig} config 
	 */
	constructor(config) {
		this.config = { ...defaultConfig, config };

		this.container.classList.add(container_styles);

		this.contents.classList.add(contents_styles);
		this.container.appendChild(this.contents);

		this.#addListeners();
	}

	#workers = [];

	/**
	 * Adds a worker to the canvas editor to handle a new object type
	 * @param {Worker} worker
	 */
	addWorker(worker) {
		const item = {
			worker,
		}
		worker.onmessage = (event) => {
			const { event_name, data } = event.data;
			switch (event_name) {
				case 'type': {
					item.type = data;
				} break;
			};
		}
		this.#workers.push(item);
	}

	/**
	 * Gets a worker from the canvas editor by type
	 * @param {string} type
	 * @returns {Worker}
	 */
	getWorker(type) {
		return this.#workers.find(item => item.type === type)?.worker;
	}

	#updateContentTransform() {
		this.contents.style.transform = 'translate(' + -this.#x + 'px, ' + -this.#y + 'px) scale(' + this.#scale + ')';
	}

	/**
	 * Calculates and updates the mouse position relative to the canvas viewport
	 * @param {number} x - The client X coordinate
	 * @param {number} y - The client Y coordinate
	 */
	calculateMousePosition(x, y) {
		const box = this.container.getBoundingClientRect();
		this.mouseX = (x - this.#x - (box.width / 2 + box.left)) / this.#scale;
		this.mouseY = (y - this.#y - (box.height / 2 + box.top)) / this.#scale;
	}

	/**
	 * Handles mouse move events
	 * @private
	 * @param {MouseEvent} event - The mouse move event
	 */
	#mouseMove = (event) => {
		this.calculateMousePosition(event.clientX, event.clientY);
	}

	/**
	 * Handle scroll events, such as panning and zooming
	 * @private
	 * @param {WheelEvent} event - The wheel event
	 */
	#scroll = (event) => {
		this.calculateMousePosition(event.clientX, event.clientY);
		if (event.ctrlKey) {
			const oldScale = this.scale;
			this.scale -= (event.deltaY / 500) * this.scale;
			this.x -= this.mouseX * (oldScale - this.scale);
			this.y -= this.mouseY * (oldScale - this.scale);
		} else {
			let moveScale = (1 / this.scale);
			if (moveScale < 0.1) moveScale = 0.1;
			if (moveScale > 1) moveScale = (moveScale - 1) * 0.01 + 1;

			this.x += event.deltaX * moveScale;
			this.y += event.deltaY * moveScale;
		}

		event.preventDefault();
	}

	/**
	 * Adds event listeners to the container
	 * @private
	 */
	#addListeners() {
		this.container.addEventListener('mousemove', this.#mouseMove);
		this.container.addEventListener('wheel', this.#scroll);
	}

	/**
	 * Removes event listeners from the container
	 * @private
	 */
	#removeListeners() {
		this.container.removeEventListener('mousemove', this.#mouseMove);
		this.container.removeEventListener('wheel', this.#scroll);
	}

	/**
	 * Destroys the canvas editor
	 */
	destroy() {
		this.destroying = true;
		this.#removeListeners();
		this.#workers.forEach(worker => worker.terminate());
	}
}
