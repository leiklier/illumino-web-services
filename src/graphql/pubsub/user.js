const User = require('../../models/user')

module.exports = pubsub => {
	User.watch().on('change', data => {
		const { operationType, fullDocument } = data

		const id = fullDocument._id.toString()
		const user = { ...fullDocument, id }

		// relevant `operationType`s:
		// ['insert', 'delete', 'replace']
		switch (operationType) {
			case 'insert': {
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
