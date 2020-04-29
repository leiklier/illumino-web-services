const fs = require('fs')
const util = require('util')
const { createLogger, format, transports } = require('winston')
const Transport = require('winston-transport')
const Event = require('./models/event')

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
		new transports.File({
			filename: `${logDir}/error.log`,
			level: 'error',
		}),
		new transports.File({
			filename: `${logDir}/combined.log`,
		}),
		new MongooseTransport(),
	],
})


logger.add(
	new transports.Console({
		format: format.simple(),
		json: false,
	}),
)


module.exports = logger
