require('dotenv').config()
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer({ autoStart: false })

const User = require('../src/models/user')
const Device = require('../src/models/device')

const users = require('./fixtures/users')
const devices = require('./fixtures/devices')

const globalSetup = async () => {
	// Create an in-memory instance of mongod.
	// All data stored will be deleted after
	// the tests have been run
	await mongod.start()

	process.env.MONGO_URI = await mongod.getConnectionString()
	global.__MONGOD__ = mongod

	// Populate db with fixtures
	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
	})

	await User.insertMany(users)
	await Device.insertMany(devices)

	await mongoose.disconnect()
}

module.exports = globalSetup
