const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const User = require('../../src/models/user')
const Device = require('../../src/models/device')
const users = require('../fixtures/users')
const devices = require('../fixtures/devices')

const db = {}
const mongod = new MongoMemoryServer({ autoStart: false })

db.create = async () => {
	await mongod.start()
	const dburl = await mongod.getConnectionString()
	await mongoose.connect(dburl, {
		useNewUrlParser: true,
	})
}

db.populate = async (models = ['User', 'Device']) => {
	if (models.includes('User')) {
		await User.insertMany(users)
	}

	if (models.includes('Device')) {
		await Device.insertMany(devices)
	}
}

db.destroy = async () => {
	await mongoose.disconnect()
	await mongod.stop()
}

module.exports = db
