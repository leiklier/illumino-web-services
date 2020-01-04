const Measurement = require('../../models/measurement')

module.exports = pubsub => {
	Measurement.watch().on('change', data => {
		// fullDocument is retrieved on all operations,
		// except on `update` - then documentKey is retrieved
		const { operationType, fullDocument, documentKey } = data

		const id = fullDocument
			? fullDocument._id.toString()
			: documentKey._id.toString()

		const measurement = { id }

		// relevant `operationType`s:
		// ['insert','update', 'delete', 'replace']
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
