const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()

const User = require('../src/models/user')
const Device = require('../src/models/device')
const users = require('./fixtures/users')
const devices = require('./fixtures/devices')

const db = {}

db.create = async () => {
	const dburl = await mongod.getConnectionString()
	await mongoose.connect(dburl, {
		useNewUrlParser: true,
	})
}

db.populate = async (schemas = ['users, devices']) => {
	if (schemas.includes('users')) {
		await User.insertMany(users)
	}

	if (schemas.includes('devices')) {
		await Device.insertMany(devices)
	}
}

db.destroy = async () => {
	await mongoose.disconnect()
	await mongod.stop()
}

module.exports = {
	db,
}
