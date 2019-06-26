const Measurement = require('../../models/measurement')

module.exports = pubsub => {
	Measurement.watch().on('change', data => {
		const { operationType, fullDocument } = data

		const id = fullDocument._id.toString()
		const measurement = { id }

		// relevant `operationType`s:
		// ['insert', 'delete', 'replace']
		switch (operationType) {
			case 'insert': {
				pubsub.publish('newMeasurements', { newMeasurements: measurement })
				break
			}
			default:
				break
		}
	})
}
