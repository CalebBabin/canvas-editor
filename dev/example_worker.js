
onmessage = (event) => {
	console.log(event.data);
}

postMessage({
	event_name: 'hello',
	data: 'world',
})