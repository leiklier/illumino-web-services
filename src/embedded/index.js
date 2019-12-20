const ws = require('ws')
const { PORT } = process.env
const wss = new ws.Server({ port: PORT + 1 })
wss.on('connection', ws => {
	console.log('connected')
	ws.on('message', message => {
		console.log('message received')
	})
})
