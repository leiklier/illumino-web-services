const Firmware = require('../../models/firmware')

module.exports = pubsub => {
	Firmware.watch().on('change', data => {
		// fullDocument is retrieved on all operations,
		// except on `update` - then documentKey is retrieved
		const { operationType, fullDocument, documentKey } = data

		const id = fullDocument
			? fullDocument._id.toString()
			: documentKey._id.toString()

		const firmware = { id }

		// relevant `operationType`s:
		// ['insert','update', 'delete', 'replace']
		switch (operationType) {
			case 'insert': {
				pubsub.publish('newFirmwares', { newFirmwares: firmware })
				break
			}
			default:
				break
		}
	})
}
