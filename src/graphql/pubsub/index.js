const { PubSub } = require('apollo-server-express')
const bindUserEvents = require('./user')
const bindMeasurementEvents = require('./measurement')

const pubsub = new PubSub()
if (process.env.NODE_ENV !== 'test') {
	// Testing uses in-memory mongod
	// which does not support change
	// streams, so skip if testing
	bindUserEvents(pubsub)
	bindMeasurementEvents(pubsub)
}

module.exports = pubsub
