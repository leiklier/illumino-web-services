const { PubSub } = require('apollo-server')
const bindUserEvents = require('./user')

const pubsub = new PubSub()
if (process.env.NODE_ENV !== 'test') {
	// Testing uses in-memory mongod
	// which does not support change
	// streams, so skip if testing
	bindUserEvents(pubsub)
}

module.exports = pubsub
