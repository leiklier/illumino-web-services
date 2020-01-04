const User = require('../../models/user')

module.exports = pubsub => {
	User.watch().on('change', data => {
		// fullDocument is retrieved on all operations,
		// except on `update` - then documentKey is retrieved
		const { operationType, fullDocument, documentKey } = data

		const id = fullDocument
			? fullDocument._id.toString()
			: documentKey._id.toString()

		const user = { id }

		// relevant `operationType`s:
		// ['insert', 'update', 'delete', 'replace']
		switch (operationType) {
			case 'insert': {
				pubsub.publish('user', { user })
				break
			}
			case 'update': {
				pubsub.publish('user', { user })
				break
			}
			case 'replace': {
				pubsub.publish('user', { user })
				break
			}
			default:
				break
		}
	})
}
