import * as WebSocket from 'ws'

const wss: WebSocket.Server = new WebSocket.Server({
    port: parseInt(process.env.PORT),
})

console.log('Server started!')

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {

        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`)
    })
})