declare var global: any

import fs from 'fs'
import { createLogger, format, transports } from 'winston'
import Transport from 'winston-transport'
import Event from './models/event'

const logDir = `${global.appRoot}/log`

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir)
}

class MongooseTransport extends Transport {
	constructor(opts) {
		super(opts)
	}

	log(info, callback) {
		setImmediate(() => {
			this.emit('logged', info)
		})

		// Perform the writing to the remote service
		const event = new Event(info)
		event.save(() => callback())
	}
}

const logger = createLogger({
	level: 'info',
	format: format.combine(format.json(), format.timestamp()),
	defaultMeta: { service: 'user-service' },
	transports: [
		new transports.Console({
			format: format.simple(),
		}),
		new MongooseTransport({}),
	],
})

export default logger
