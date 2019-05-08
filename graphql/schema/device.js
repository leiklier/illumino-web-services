const { gql } = require('apollo-server')
const bcrypt = require('bcryptjs')
const { isMACAddress } = require('validator')

const User = require('../../models/user')
const Device = require('../../models/device')

const typeDefs = gql`
	type Device {
		id: ID!
		mac: String!
		name: String
		owner: User
		managers: [User]!
	}

	input DeviceInput {
		mac: String!
		authKey: String!
		pin: Int
		ownerEmail: String
		name: String
	}
`

const DeviceResolver = {
	id: async (device, _, { deviceLoader }) => {
		const deviceFound = await deviceLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.id
	},
	mac: async (device, _, { deviceLoader }) => {
		const deviceFound = await deviceLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.mac
	},
	name: async (device, _, { deviceLoader }) => {
		const deviceFound = await deviceLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.name
	},
	owner: async (device, _, { deviceLoader }) => {
		const deviceFound = await deviceLoader.load(device.id)
		if (!deviceFound) {
			return null
		}
		return deviceFound.owner
	},
	managers: async (device, _, { deviceLoader }) => {
		const deviceFound = await deviceLoader.load(device.id)
		if (!deviceFound) {
			return []
		}
		return deviceFound.managers
	},
}

const queryResolvers = {}
const mutationResolvers = {}

queryResolvers.device = async (_, { mac }, context) => {
	let device
	if (mac) {
		device = await Device.findOne({ mac })
	} else if (context.device) {
		device = await Device.findOne({ _id: context.device.id })
	} else {
		return null
	}

	if (!device) {
		return null
	}

	return { id: device.id }
}

mutationResolvers.createDevice = async (_, { deviceInput }) => {
	if (!isMACAddress(deviceInput.mac)) {
		throw new Error('Invalid MAC address')
	}

	const existingDevice = await Device.findOne({ mac: deviceInput.mac })
	if (existingDevice) {
		throw new Error('Device exists already.')
	}

	const device = new Device({
		lastSeenAt: new Date(),
		mac: deviceInput.mac,
		authKey: await bcrypt.hash(deviceInput.authKey, 12),
	})

	if (deviceInput.pin) {
		if (deviceInput.pin.toString().length > 4) {
			throw new Error('Pin too long. Should be 4 digits.')
		}
		device.pin = await bcrypt.hash(deviceInput.pin.toString(), 12)
	}

	if (deviceInput.name) {
		device.name = deviceInput.name
	}

	if (!deviceInput.ownerEmail) {
		await device.save()

		return { id: device.id }
	}

	const owner = await User.findOne({ email: deviceInput.ownerEmail })
	if (!owner) {
		throw new Error('Owner does not exist!')
	}

	// Need to do two operations concurrently, so use transaction
	const session = await Device.startSession()
	session.startTransaction()
	try {
		device.owner = owner.id
		owner.devicesOwning.push(device.id)
		await owner.save()
		await device.save()

		return { id: device.id }
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		throw err
	}
}

mutationResolvers.claimDevice = async (_, { mac }, context) => {
	const ownerId = context.user.id

	const device = await Device.findOne({ mac })
	const owner = await User.findOne({ _id: ownerId })

	if (!device) {
		throw new Error('Device does not exist!')
	}

	if (!owner) {
		throw new Error('User does not exist!')
	}

	if (device.owner) {
		throw new Error('Device has already been claimed!')
	}

	owner.devicesOwning.push(device.id)
	device.owner = ownerId

	// Need to update two documents concurrently
	const session = await Device.startSession()
	session.startTransaction()
	try {
		await owner.save()
		await device.save()
		return { id: device.id }
	} catch (err) {
		await session.abortTransaction()
		session.endSession()
		throw err
	}
}

mutationResolvers.setDevicePin = async (_, { mac, pin }) => {
	// Permittable by Device.owner, admins,
	// and on all Devices with no Device.owner

	if (pin.toString().length > 4) {
		throw new Error('Pin too long. Should be 4 digits.')
	}

	const device = await Device.findOne({ mac }).populate('owner', '_id')
	if (!device) {
		throw new Error('Device does not exist!')
	}

	device.pin = await bcrypt.hash(pin.toString(), 12)

	await device.save()
	return { id: device.id }
}

mutationResolvers.setDeviceName = async (_, { mac, name }) => {
	const device = await Device.findOne({ mac }).populate('owner', '_id')
	if (!device) {
		throw new Error('Device does not exist!')
	}

	device.name = name
	await device.save()

	return { id: device.id }
}

mutationResolvers.txBeacon = async (_, __, context) => {
	context.device.lastSeenAt = new Date()
	await context.device.save()

	return context.device.lastSeenAt.toISOString()
}

module.exports = {
	typeDefs,
	queryResolvers,
	mutationResolvers,
	DeviceResolver,
}
