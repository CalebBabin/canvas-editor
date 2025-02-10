function sendType() {
	postMessage({
		event_name: 'type',
		data: 'text',
	})
}

const items = [];

self.addEventListener('message', (event) => {
	console.log(event.data);
	const [event_name, data] = event.data;
	switch (event_name) {
		case 'update': {
			const id = data.id;
			let item = items.find(item => item.id === id);
			if (!item) {
				items.push(data);
				item = data;
			} else {
				item = { ...item, ...data };
			}
			const context = item.canvas.getContext('2d');
			context.clearRect(0, 0, item.canvas.width, item.canvas.height);
			context.fillStyle = 'red';

			let textSize = 0;
			let measuredSize;
			const text = item.data.text;
			while (true) {
				textSize++;
				context.font = '400 ' + textSize + 'px sans-serif';
				measuredSize = context.measureText(text);
				if (measuredSize.width >= item.canvas.width) {
					textSize--;
					break;
				};

				if (textSize > 100) {
					textSize = 100;
					break;
				}
			}

			const textHeight = measuredSize.actualBoundingBoxAscent;

			context.font = '400 ' + textSize + 'px sans-serif';
			context.strokeStyle = 'white';
			context.lineWidth = 2;
			context.strokeText(text, 0, item.canvas.height / 2 + textHeight / 2);
			context.fillText(text, 0, item.canvas.height / 2 + textHeight / 2);


			context.lineWidth = 1;
			context.beginPath();
			context.rect(0, item.canvas.height / 2, item.canvas.width, 0);
			context.stroke();
		} break;
		case 'type': {
			sendType();
		} break;
	}
});

