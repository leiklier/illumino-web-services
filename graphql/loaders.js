const DataLoader = require('dataloader')

const User = require('../models/user')
const Device = require('../models/device')

const userLoader = new DataLoader(userIds => {
	return User.find({ _id: { $in: userIds } })
		.populate('devicesOwning', '_id')
		.populate('devicesManaging', '_id')
})

const deviceLoader = new DataLoader(deviceIds => {
	return Device.find({ _id: { $in: deviceIds } })
		.populate('owner', '_id roles')
		.populate('managers', '_id roles')
})

const loadUserById = async (userId, nestingLevel) => {
	if (typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
		return null
	}

	try {
		const user = await userLoader.load(userId)
		return populateUser(user, --nestingLevel)
	} catch (err) {
		throw err
	}
}

const loadUsersById = async (userIds, nestingLevel) => {
	if (typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
		return null
	}

	try {
		const users = await userLoader.loadMany(userIds)
		return (populatedUsers = users.map(user =>
			populateUser(user, --nestingLevel),
		))
	} catch (err) {
		throw err
	}
}

const loadDeviceById = async (deviceId, nestingLevel) => {
	if (typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
		return null
	}

	try {
		const device = await deviceLoader.load(deviceId)
		return populateDevice(device, --nestingLevel)
	} catch (err) {
		throw err
	}
}

const loadDevicesById = async (deviceIds, nestingLevel) => {
	if (typeof nestingLevel !== 'undefined' && nestingLevel === 0) {
		return null
	}

	try {
		const devices = await deviceLoader.loadMany(deviceIds)
		return (populatedDevices = devices.map(device =>
			populateDevice(device, --nestingLevel),
		))
	} catch (err) {
		throw err
	}
}

const populateUser = (user, nestingLevel) => {
	return {
		...user.toObject(),
		password: null,
		devicesOwning: loadDevicesById.bind(this, user.devicesOwning, nestingLevel),
		devicesManaging: loadDevicesById.bind(
			this,
			user.devicesManaging,
			nestingLevel,
		),
	}
}

const populateDevice = (device, nestingLevel) => {
	return {
		...device.toObject(),
		authKey: null,
		pin: null,
		owner: loadUserById.bind(this, device.owner, nestingLevel),
		managers: loadUsersById.bind(this, device.managers, nestingLevel),
	}
}

module.exports = {
	loadUserById,
	loadUsersById,
	loadDeviceById,
	loadDevicesById,
}
