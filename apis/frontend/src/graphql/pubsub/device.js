const Device = require('../../models/device')

module.exports = pubsub => {
	Device.watch().on('change', data => {
		// fullDocument is retrieved on all operations,
		// except on `update` - then documentKey is retrieved
		const { operationType, fullDocument, documentKey } = data

		const id = fullDocument
			? fullDocument._id.toString()
			: documentKey._id.toString()

		const device = { id }

		// relevant `operationType`s:
		// ['insert','update', 'delete', 'replace']
		switch (operationType) {
			case 'update': {
				pubsub.publish('device', { device })
				break
			}
			case 'replace': {
				pubsub.publish('device', { device })
				break
			}
			default:
				break
		}
	})
}
